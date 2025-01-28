import { webComponentService } from 'typlib';
import { loadRemoteModule, LoadRemoteModuleScriptOptions } from "@angular-architects/module-federation"
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
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
import { ActivatedRoute, NavigationEnd, Router, Routes } from "@angular/router"
import { ChromeMessagingService } from "./services/chrome-messaging.service"
import {  EVENT_BUS } from 'typlib';
import { BehaviorSubject, filter, Observable, Subject, Subscription, take, takeUntil, takeWhile } from "rxjs";
import { StatService } from "./services/stat-service";
import { RegisterComponentsBusEvent, RegisterComponentsBusEventPayload } from './app.component.types';
import { FunctionQueueService } from './services/function-queue.service';
import { GroupButtonsDirective } from './directives/group-buttons.directive';
import { isProductRoute } from './utilites/isRoutePresent';
import { Location } from '@angular/common'; // Import Location
import { BusEventStoreService } from './services/bus-event-store.service';
import { CoreService } from './services/core.service';


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
  payload: Record<string, any>
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

  private destroy$ = new Subject<void>(); // For unsubscribing

  constructor(
    private router: Router,
    private chromeMessagingService: ChromeMessagingService,
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    private injector: Injector,
    private _statService: StatService,
    private renderer: Renderer2, 
    private functionQueueService: FunctionQueueService,
    private _busEventStoreService: BusEventStoreService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadComponent('faq')
  }
  currentRoute: string = '';
  //new
  @ViewChild('remoteButtonContainer2', { read: ViewContainerRef }) remoteButtonContainer2!: ViewContainerRef;
  ngOnInit(): void {
    
    this.chromeMessagingService.messages.subscribe((message: ChromeMessage) => {
      // console.log('HOST received WORKER event: ' + message.event);
      
      if (message.event === 'SHOW_OLDEST_TICKET') {
        this.showOldestTicket(message.payload['tickets'])
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
      /**
       * Зарегистрированные компоненты не нужно рендерить
       * если роут не продуктовый, сохраняем их в стор
       */
      if (res.event === 'REGISTER_COMPONENTS') {
        this._busEventStoreService.addEvent(res)
        
        
      }
      /**
       * Когда продуктовый рутовый компонент инициализируется,
       * он отправляет ивент, чтобы отрендерить свои навигационные кнопки.
       * Идем в стор ивентов и достаем их.
       */
      if (res.event === 'RENDER_COMPONENTS') {
        this.cdr.detectChanges()
        const productButtonsEvents = this._busEventStoreService.getEventsByProps(
          'REGISTER_COMPONENTS',
          res.from,
          res.payload['payloadFilter']
        )
        console.log(productButtonsEvents)
        if (productButtonsEvents && productButtonsEvents.length) {
          productButtonsEvents.forEach(el => {
            this.renderProductNavButton(el)
          })
        }
      }
    })
  }

  private renderProductNavButton(res: BusEvent) {
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

  async loadRemoteMainButtons (): Promise<void> {
    try {
      const remoteModule = await loadRemoteModule({
        remoteName: "faq",
        remoteEntry: `${process.env["FAQ_WEB_REMOTE_ENTRY_URL"]}`,
        exposedModule: './RemoteButtonModule',
      });
      
      const remoteButtonModule = remoteModule.RemoteButtonModule;
      
      const componentRef = this.remoteButtonContainer2.createComponent(
        remoteButtonModule.components[0]
      );
      (componentRef as any).instance.buttonClick.subscribe(() => {
        this.router.navigateByUrl('/faq')
      });

      const fontInitializerService = this.injector.get<any>(remoteButtonModule.services[0]);
      fontInitializerService.initializeFonts();

    } catch (error) {
      console.error('Error loading remote module:', error);
    }
  }

  ngAfterViewInit() {
    this.ngAfterViewInit$.next(true);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public goHome(): void {
    this.router.navigateByUrl('/home')
  }

  public isHomeRoute(): boolean {
    return this.router.url === '/home';
  }

  showOldestTicket (tickets: any[] = []) {
    this.router.navigateByUrl(remotes['faq'].routerPath).then(() => {
      const busEvent: BusEvent = {
        from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
        to: `${process.env['PROJECT_ID']}@web`,
        event: 'SHOW_OLDEST_TICKET',
        payload: { 
          routerPath: remotes['faq'].routerPath,
          tickets: tickets
        },
      };
      this.eventBusPusher(busEvent);
    })
  }

  async loadComponent(projectId: string): Promise<void> {
        
    const childRoutes: Routes = [
      {
        path: remotes[projectId as keyof typeof remotes].routerPath,
        loadChildren: () => {
          return loadRemoteModule(remotes[projectId as keyof typeof remotes].remoteModuleScript).then((m) => {
            const remoteModule = m[remotes[projectId as keyof typeof remotes].moduleName]
            
            return remoteModule
          })
        },
      },
    ];
    
    this.router.resetConfig([...this.router.config, ...childRoutes]);
    this.sendRoutePathToRemoteMfe(projectId)
    
    const isFaqProductRoute = isProductRoute(remotes, projectId)
    
    /**
     * При нахождении на роуте remote mfe,
     * нужно дождаться перехода по его роуту
     * и только потом подгружать другой модуль(script) этого же remoteName
     * todo: добавить понимание, нужна ли загрузка шаредного модуля
     */
    this.router.events
    .pipe(
      filter((event) => {
        if (!isFaqProductRoute) {
          return true;
        }
        return event instanceof NavigationEnd;
      }),
      take(1),
      takeUntil(this.destroy$)
    )
    .subscribe(() => {
      this.loadRemoteMainButtons()
    });
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
    const remoteButton = this.renderer.createElement(customElementName);
    const container = this.remoteButtonContainer.nativeElement;
    this.renderer.appendChild(container, remoteButton);

    if (customElementInputs && Object.keys(customElementInputs).length) {
      Object.entries(customElementInputs).forEach(([key, value]) => {
        this.renderer.setAttribute(remoteButton, key, String(value));
      })
    }

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
    console.log(this._busEventStoreService.getAllEvents())
  }
}
