import { webComponentService } from 'typlib';
import { loadRemoteModule, LoadRemoteModuleScriptOptions } from "@angular-architects/module-federation"
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  InjectionToken,
  Injector,
  NgModuleRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from "@angular/core"
import { Router, Routes } from "@angular/router"
import { ChromeMessagingService } from "./services/chrome-messaging.service"
import {  EVENT_BUS } from 'typlib';
import { BehaviorSubject, filter, Observable, Subject } from "rxjs";
import { StatService } from "./services/stat-service";
import { RegisterComponentsBusEvent, RegisterComponentsBusEventPayload } from './app.component.types';
import { FunctionQueueService } from './services/function-queue.service';
import { GroupButtonsDirective } from './directives/group-buttons.directive';

export interface BusEvent<T = Record<string, any>> {
  from: string;
  to: string;
  event: string;
  payload: T;
  self?: true;
  status?: string;
}

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

export interface ChromeMessage { // todo change to busEvent, add payload generic to busEvent
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
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("placeHolder", { read: ViewContainerRef })
  viewContainer!: ViewContainerRef

  @ViewChild('remoteButtonContainer', { static: false }) remoteButtonContainer!: ElementRef;

  @ViewChild(GroupButtonsDirective) groupButtonsDirective!: GroupButtonsDirective;

  ngAfterViewInit$ = new BehaviorSubject<boolean>(false);
  constructor(
    private router: Router,
    private chromeMessagingService: ChromeMessagingService,
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    private injector: Injector,
    private _statService: StatService,
    private renderer: Renderer2, private el: ElementRef,
    private functionQueueService: FunctionQueueService
  ) {
    this.loadComponent('faq')
  }
  currentRoute: string = '';

  ngOnInit(): void {
    this.chromeMessagingService.messages.subscribe((message: ChromeMessage) => {
      console.log('HOST received WORKER event: ' + message.event);
      
      if (message.event === 'SHOW_OLDEST_TICKET' && this.isAllowedAction(message)) {
        this.showOldestTicket()
      }
      if (message.event === 'RETRY_SEND_STAT') {
        // console.log('RETRY_SEND_STAT')
        this._statService.sendStatData(message.payload)
      }
    });
    this.eventBusListener$.subscribe((res: BusEvent) => {
      console.log('HOST received BUS event: ' + res.event)
      if (res.event === "CLOSE_EXT") {
        window.close();
      }
      if (res.event === 'REGISTER_COMPONENTS') {
        // (res as RegisterComponentsBusEvent).payload.customElementName
        this.functionQueueService.addToQueue(
          this.appendRemoteButton,
          this,
          {
            customElementName: (res as RegisterComponentsBusEvent).payload.customElementName,
            url: (res as RegisterComponentsBusEvent).payload.url,
            customElementInputs: (res as RegisterComponentsBusEvent).payload.customElementInputs,
            customElementTransclusion: (res as RegisterComponentsBusEvent).payload.customElementTransclusion
          },
          this.ngAfterViewInit$
        );
      }
    })
  }

  ngAfterViewInit() {
    this.ngAfterViewInit$.next(true);
  }

  ngOnDestroy() {
    //
  }

  showOldestTicket () {
    const busEvent: BusEvent = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `${process.env['PROJECT_ID']}@web`,
      event: 'SHOW_OLDEST_TICKET',
      payload: { routerPath: remotes['faq'].routerPath },
    };
    this.eventBusPusher(busEvent);
  }

  async loadComponent(projectId: string): Promise<void> {
        
    const childRoutes: Routes = [
      {
        path: remotes[projectId as keyof typeof remotes].routerPath,
        loadChildren: () => {
          return loadRemoteModule(remotes[projectId as keyof typeof remotes].remoteModuleScript).then((m) => {
            return m[remotes[projectId as keyof typeof remotes].moduleName]
          })
        },
      },
    ];
    
    this.router.resetConfig([...this.router.config, ...childRoutes]);

    this.router.navigate([remotes[projectId as keyof typeof remotes].routerPath]);
    this.sendRoutePathToRemoteMfe(projectId)
    
  }

  private isAllowedAction(chromeEvent: ChromeMessage): boolean {
    if (chromeEvent.event === 'SHOW_OLDEST_TICKET') {
      if (this.router.url === '/faq') {
        return true
      }
      console.log('Bypass route change')
      return false
    }
    return true
  }

  private sendRoutePathToRemoteMfe(projectId: string) {
    const routePathBusEvent: BusEvent = {
      event: "ROUTER_PATH",
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `${projectId}@web`,
      payload: { routerPath: remotes[projectId as keyof typeof remotes].routerPath },
    }
    this.eventBusPusher(routePathBusEvent);
  }

  private appendRemoteButton({customElementName, url, customElementInputs, customElementTransclusion}: {
    customElementName: string, 
    url: string,
    customElementInputs: any,
    customElementTransclusion: string
  }) {
    console.log(customElementName)
    console.log(url)
    try {
      webComponentService.getComponent(customElementName)
    } catch (e) { console.warn(e)}
    const remoteButton = this.renderer.createElement(customElementName);
    // this.renderer.setAttribute(remoteButton, 'id', 'remoteButton');
    const container = this.remoteButtonContainer.nativeElement;
    this.renderer.appendChild(container, remoteButton);

    if (customElementInputs && Object.keys(customElementInputs).length) {
      Object.entries(customElementInputs).forEach(([key, value]) => {
        console.log(key, value)
        this.renderer.setAttribute(remoteButton, key, String(value));
      })
    }
    
    this.renderer.setAttribute(remoteButton, 'id', String(customElementInputs.urlActiveClass));
    // this.renderer.setAttribute(remoteButton, 'routerLink1', String('dwadw'));
    // if (customElementName === 'faq-add-btn' && url === 'schedule-create') {
    //   this.renderer.setAttribute(remoteButton, 'routerLink', url);
    // }

    if (customElementTransclusion && customElementTransclusion.length) {
      const buttonTag = remoteButton.querySelector('button');
      const projectedContent = this.renderer.createText(customElementTransclusion);
      this.renderer.appendChild(buttonTag, projectedContent);
    }
    
    this.groupButtonsDirective.triggerGrouping()

    this.renderer.listen(remoteButton, 'buttonClick', (_: CustomEvent) => {
      // this.router.navigateByUrl(url).then(() => {
      //   this.renderer.setAttribute(remoteButton, 'color', 'purple')
      //   // this.renderer.setAttribute(remoteButton, 'url', url);
      // })
    });
    
  }

  check() {
    // // webComponentService.getComponent('remote-button') // check for existence
    // this.appendRemoteButton('remote-button')
  }
}

// width: 20px;
// height: 20px;
// display: block;
// color: red;
// z-index: 99999999999;
// position: relative;