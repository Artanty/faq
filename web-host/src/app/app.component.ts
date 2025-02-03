import { loadRemoteModule, LoadRemoteModuleScriptOptions } from "@angular-architects/module-federation"
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  InjectionToken,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from "@angular/core"
import { Router, Routes } from "@angular/router"
import { ChromeMessagingService } from "./services/chrome-messaging.service"
import { BusEvent, EVENT_BUS } from 'typlib';
import { BehaviorSubject, filter, Observable, Subject } from "rxjs";
import { StatService } from "./services/stat-service";
import { RegisterComponentsBusEvent, RegisterComponentsBusEventPayloadItem } from './app.component.types';
import { FunctionQueueService } from './services/function-queue.service';
import { GroupButtonsDirective } from './directives/group-buttons.directive';
import { BusEventStoreService } from './services/bus-event-store.service';

// export interface BusEvent<T = Record<string, any>> {
//   from: string;
//   to: string;
//   event: string;
//   payload: T;
//   self?: true;
//   status?: string;
// }

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

export interface RemoteBody {
  url: string,
  buttonName: string,
  buttonTitle: string,
  remoteModuleScript: LoadRemoteModuleScriptOptions,
  routerPath: string
  moduleName: string
}

export interface Remotes {
  [key: string]: RemoteBody
}
export interface ProductButton {
  name: string, 
  imgSrcBaseUrl: string,
  buttonName: string
  buttonTitle: string
  routerPath: string
}

// дублирование ([key] = remoteName) для возможного разруливания конфликта имен 
// или возможности загрузки нескольких инстансов - todo пробовать.
// exposedModule не вынесено за скобки для возможности загружать компонент, а не модуль.
//[key] всегда равняется роуту.
const remotes: Remotes = {
  faq: {
    url: `${process.env["FAQ_WEB_URL"]}`,
    buttonName: 'テスト',
    buttonTitle: 'Экзамен',
    remoteModuleScript: {
      remoteName: "faq",
      remoteEntry: `${process.env["FAQ_WEB_URL"]}/remoteEntry.js`,
      exposedModule: "./Module",
    },
    routerPath: "faq",
    moduleName: "FaqModule"
  },
  au: {
    url: `${process.env["AU_WEB_URL"]}`,
    buttonName: 'AU',
    buttonTitle: 'Аутентификация',
    remoteModuleScript: {
      remoteName: "au",
      remoteEntry: `${process.env["AU_WEB_URL"]}/remoteEntry.js`,
      exposedModule: "./Module2",
    },
    routerPath: "au",
    moduleName: "AuthModule",
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
          .pipe(filter((res) => res.to === `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`));
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
  @ViewChild('productNavContainer', { static: false }) productNavContainer!: ElementRef;  
  @ViewChild(GroupButtonsDirective) groupButtonsDirective!: GroupButtonsDirective;
  
  public productMainButtons: ProductButton[] = []
  
  private ngAfterViewInit$ = new BehaviorSubject<boolean>(false);

  private destroy$ = new Subject<void>(); // For unsubscribing
  
  constructor(
    private router: Router,
    private chromeMessagingService: ChromeMessagingService,
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    private _statService: StatService,
    private renderer: Renderer2, 
    private functionQueueService: FunctionQueueService,
    private _busEventStoreService: BusEventStoreService,
    private cdr: ChangeDetectorRef,
  ) {
    this._loadRemoteModule('au')
    this._loadRemoteModule('faq')
  }
  currentRoute: string = '';
  ngOnInit(): void {
    this.chromeMessagingService.messages.subscribe((message: ChromeMessage) => {
      // console.log('HOST received WORKER event: ' + message.event);
      
      if (message.event === 'SHOW_OLDEST_TICKET') {
        this._showOldestTicket(message.payload['tickets']) // todo bypass here, catch in faq@web
      }
      if (message.event === 'RETRY_SEND_STAT') {
        this._statService.sendStatData(message.payload)
      }
    });

    this.eventBusListener$.subscribe((res: BusEvent) => {
      // console.log('HOST received BUS event: ' + res.event)
      if (res.event === "CLOSE_EXT") {
        window.close();
      }
      /**
       * Зарегистрированные компоненты не нужно рендерить
       * если роут не продуктовый, сохраняем их в стор
       */
      if (res.event === 'REGISTER_COMPONENTS') {
        this._busEventStoreService.addEvent(res).then(() => {
          this._sendDoneEvent(res)
        })
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
        this.functionQueueService.addToQueue(
          this._clearProductNavContainer,
          this,
          undefined,
          this.ngAfterViewInit$
        );

        if (productButtonsEvents && productButtonsEvents.length) {
          if (productButtonsEvents.length !== 1) {
            console.error('IT SHOULD ONLY ONE EVENT WITH REGISTERED COMPONENTS FROM ' + res.from)
          }
          console.log(productButtonsEvents[0])
          productButtonsEvents[0]?.payload?.items.forEach((el: any) => {
            this._renderProductNavButton(el)
          })
        }
      }
      if (res.event === 'ASK_ROUTER_PATH') {
        this._sendRoutePathToRemoteMfe(res.payload["projectId"])
      }
      
    })    
  }

  private _sendDoneEvent(busEvent: BusEvent): void {
    const doneBusEvent: BusEvent = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `${busEvent.from}`,
      event: `${busEvent.event}_DONE`,
      payload: null
    }
    this.eventBusPusher(doneBusEvent)
  }
  
  private _clearProductNavContainer (): void {
    const container: HTMLElement = this.productNavContainer.nativeElement;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  private _renderProductNavButton(payloadItem: RegisterComponentsBusEventPayloadItem) {
    this.functionQueueService.addToQueue(
      this._appendRemoteButton,
      this,
      {
        customElementName: payloadItem.customElementName,
        customElementInputs: payloadItem.customElementInputs,
        customElementTransclusion: payloadItem.customElementTransclusion
      },
      this.ngAfterViewInit$
    );
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

  /**
   * Чтобы програмно перейти на дочерний роут продукта, нужно
   * перейти на рутовый роут продукта, чтобы он начал слушать события
   * и после этого запушить событие с нужным действием.
   * Почему просто не пейти на дочерний роут ремоута? /faq/ticket.
   * Веб-хост не должен знать какой роут за что отвечает.
   * Он отправляет команду, за реализацию отвечает ремоут.
   * todo можно попробовать регистрировать роуты ремоута в сет:
   * remoteRouteSet = { 'SHOW_OLDEST_TICKET': '/faq/ticket' }
   * и проходиться по ним при каждом полученном вебХостом busEvent'е.
   * При этом если из веб-воркера пришли загруженные события, придется 
   * сохранить их в busEventStoreService, затем вернуть и очистить.
  */
  private _showOldestTicket (tickets: any[] = []) {
    const projectId = 'faq'
    const url = remotes[projectId].routerPath!
    
    this.router.navigateByUrl(url).then(() => {
      const busEvent: BusEvent = {
        from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
        to: `${process.env['PROJECT_ID']}@web`,
        event: 'SHOW_OLDEST_TICKET',
        payload: { 
          tickets: tickets
        },
      }
      this.eventBusPusher(busEvent);
    })
  }

  private async _loadRemoteModule(projectId: string): Promise<void> {
    const childRoutes: Routes = [
      {
        path: remotes[projectId as keyof typeof remotes].routerPath,
        loadChildren: () => {
          return loadRemoteModule(remotes[projectId as keyof typeof remotes].remoteModuleScript)
          .then((m) => {
            const remoteModule = m[remotes[projectId as keyof typeof remotes].moduleName!]
            
            return remoteModule
          })
        },
      },
    ];
    this.router.resetConfig([...this.router.config, ...childRoutes]);
    
    this._sendRoutePathToRemoteMfe(projectId)

    this._renderProductMainButton(projectId)
  }

  private _renderProductMainButton (projectId: string) {
    this.productMainButtons.push({
      name: projectId, 
      imgSrcBaseUrl: remotes[projectId].url,
      buttonName: remotes[projectId].buttonName,
      buttonTitle: remotes[projectId].buttonTitle,
      routerPath: remotes[projectId].routerPath
    })
  }

  private _sendRoutePathToRemoteMfe(projectId: string) {
    const routePathBusEvent: BusEvent = {
      event: "ROUTER_PATH",
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `${projectId}@web`,
      payload: { routerPath: remotes[projectId as keyof typeof remotes].routerPath },
    }
    this.eventBusPusher(routePathBusEvent);
  }

  private _appendRemoteButton({ customElementName, customElementInputs, customElementTransclusion }: {
    customElementName: string, 
    customElementInputs: Record<string, string>,
    customElementTransclusion: string
  }) {
    const container = this.productNavContainer.nativeElement;
    
    const remoteButton = this.renderer.createElement(customElementName);
    
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
      //
    });
  }

  check() {
    this.router.navigateByUrl('au')
  }
  tick() {
    this.router.navigateByUrl('/faq/ticket')
  }
}
