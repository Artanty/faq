import { loadRemoteModule, LoadRemoteModuleScriptOptions } from "@angular-architects/module-federation"
import {
  Component,
  Inject,
  InjectionToken,
  Injector,
  NgModuleRef,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from "@angular/core"
import { Router, Routes } from "@angular/router"
import { ChromeMessagingService } from "./services/chrome-messaging.service"
import { BusEvent, EVENT_BUS } from 'typlib';
import { BehaviorSubject, filter, Observable } from "rxjs";

export interface SendStatData {
  projectId: string
  slaveRepo: string
  commit: string
}
export interface ChromeMessagePayload {
  projectId: string
  namespace: string
  stage: 'UNKNOWN' | 'RUNTIME',
  eventData: string | SendStatData
}

export interface ChromeMessage {
  from: string
  to: string
  event: string
  payload: ChromeMessagePayload
}

export const EVENT_BUS_LISTENER = new InjectionToken<Observable<BusEvent>>('');
export const EVENT_BUS_PUSHER = new InjectionToken<
  (busEvent: BusEvent) => void
>('');

export interface RemotesBody {
  remoteModuleScript: LoadRemoteModuleScriptOptions,
  routerPath: string
  moduleName: string
}
export interface Remotes {
  [key: string]: RemotesBody
}
// дублирование ([key] = remoteName) для возможного разруливания конфликта имен 
// или возможности загрузки нескольких инстансов - todo пробовать.
// exposedModule не вынесено за скобки для возможности загружать компонент, а не модуль.
//[key] всегда равняется роуту.
const remotes: Remotes = {
  faq: { 
    remoteModuleScript: {
      remoteName: "faq",
      remoteEntry: `${process.env["FAQ_WEB_REMOTE_ENTRY_URL"]}`,
      exposedModule: "./Module",
    },
    routerPath: "faq",
    moduleName: "FaqModule"
  }
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  providers: [
    {
      provide: EVENT_BUS_LISTENER,
      useFactory: (eventBus$: BehaviorSubject<BusEvent>) => {
        return eventBus$
          .asObservable()
          // .pipe(filter((res) => res.to === process.env['APP']));
      },
      deps: [EVENT_BUS],
    },
    {
      provide: EVENT_BUS_PUSHER,
      useFactory: (eventBus$: BehaviorSubject<BusEvent>) => {
        return (busEvent: BusEvent) => {
          eventBus$.next(busEvent);
        };
      },
      deps: [EVENT_BUS],
    },
  ],
})
export class AppComponent implements OnInit {
  @ViewChild("placeHolder", { read: ViewContainerRef })
  viewContainer!: ViewContainerRef
  constructor(
    private router: Router,
    private chromeMessagingService: ChromeMessagingService,
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    private injector: Injector,
  ) {
    
    this.loadComponent('faq')
    // console.log(this.router)
  }

  ngOnInit(): void {
    this.chromeMessagingService.messages.subscribe((message: ChromeMessage) => {
      console.log('Angular received event: ' + message.event);
      if (message.event === 'SHOW_OLDEST_TICKET') {
        this.showOldestTicket()
      }
      if (message.event === 'RETRY_SEND_STAT') {
        console.log('RETRY_SEND_STAT')
      }
    });
    this.eventBusListener$.subscribe(res=> {
      console.log(res)
      if (res.event === "CLOSE_EXT") {
        window.close();
      }
    })
  }

  showOldestTicket () {
    const busEvent: BusEvent = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `${process.env['PROJECT_ID']}@web`,
      event: 'SHOW_OLDEST_TICKET',
      payload: { status: '' },
    };
    this.eventBusPusher(busEvent);
  }

  async loadComponent(projectId: string): Promise<void> {
    
    const m = await loadRemoteModule(remotes[projectId as keyof typeof remotes].remoteModuleScript)
    
    const childRoutes: Routes = [
      {
        path: remotes[projectId as keyof typeof remotes].routerPath,
        loadChildren: () => m[remotes[projectId as keyof typeof remotes].moduleName],
      },
    ];
    this.router.resetConfig([...this.router.config, ...childRoutes]);
    // this.router.navigate(['/child/ticket/1']);
  }
}
