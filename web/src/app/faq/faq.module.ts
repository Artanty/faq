import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Injector, InjectionToken, Provider, Inject } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { TicketDetailComponent } from "./components/ticket-detail/ticket-detail.component";
import { TicketListComponent } from "./components/ticket-list/ticket-list.component";
import { EVENT_BUS_LISTENER, FaqComponent } from "./faq.component";
import { TicketCreateComponent } from './components/ticket-create/ticket-create.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { TextareaComponent } from './components/textarea/textarea.component';
import { SelectComponent } from './components/select/select.component';
import { ButtonComponent } from './components/button/button.component';
import { AnswerListComponent } from './components/answer-list/answer-list.component';
import { FlipComponent } from './components/flip/flip.component';
import { ScheduleCreateComponent } from './components/schedule-create/schedule-create.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { ScheduleListComponent } from './components/schedule-list/schedule-list.component';
import { AssetUrlUpdateDirective } from "./directives/asset-url-update.directive";
import { CoreService } from "./services/core.service";

import { ProductButtonTextComponent } from "./components/_remotes/product-button-text.component";
import { ProductButtonIconComponent } from "./components/_remotes/product-button-icon.component";
import { TicketQueueService } from "./services/ticketQueue.service";
import { OpenerService } from "./services/opener.service";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { BusEvent, EVENT_BUS, EVENT_BUS_PUSHER } from "typlib";
import { buildUrl } from "./services/route-builder";
import { createCustomElement } from "@angular/elements";
import { RemoteButtonModule } from "./components/_remotes/remote-button.module";


export const CHILD_ROUTES = [
    {
        path: '',
        component: FaqComponent,
        children: [
            {
                path: '', component: WelcomeComponent
            },
            {
                path: 'ticket', component: TicketDetailComponent
            },
            { 
                path: 'ticket/:id', component: TicketDetailComponent
            }, 
            {
                path: 'ticket-create', component: TicketCreateComponent
            },
            { 
                path: 'ticket-list', component: TicketListComponent
            }, 
            { 
                path: 'answer-list/:id', component: AnswerListComponent
            },
            {
                path: 'schedule-create', component: ScheduleCreateComponent
            },
            {
                path: 'schedule-list', component: ScheduleListComponent
            }
        ]
    }, 
]

@NgModule({
    declarations: [
        FaqComponent,
        TicketListComponent,
        TicketDetailComponent,
        TicketCreateComponent,
        WelcomeComponent,
        TextareaComponent,
        SelectComponent,
        ButtonComponent,
        AnswerListComponent,
        FlipComponent,
        ScheduleCreateComponent,
        DatePickerComponent,
        ScheduleListComponent,
        AssetUrlUpdateDirective,
        ProductButtonIconComponent,
        ProductButtonTextComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forChild(CHILD_ROUTES),
        HttpClientModule,
    ],
    providers: [
      { 
        provide: 'WEB_VERSION', 
        useValue: process.env['FAQ_WEB_VERSION']
      },
      OpenerService,
      CoreService,
      TicketQueueService,
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
    exports: [
        FaqComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FaqModule {
  constructor(
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
    @Inject(EVENT_BUS_PUSHER)
    private readonly eventBusPusher: (busEvent: BusEvent) => void,
    private _coreService: CoreService,
    private injector: Injector,
    @Inject('WEB_VERSION') private readonly webVersion: string
  ) {
    this.eventBusListener$.subscribe((res: BusEvent)=>{
      if (res.event === 'ROUTER_PATH') {
        this._coreService.setRouterPath((res.payload as any).routerPath)
        this.shareComponentsWithHost()
      }
    })
  }
  ngDoBootstrap() {}

  shareComponentsWithHost() {
    this.registerRemoteButtonElement()
    const registerComponentsBase = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `${process.env['PROJECT_ID']}@web-host`,
      event: 'REGISTER_COMPONENTS',
      payload: {
        componentType: 'PRODUCT_BUTTON',
        webVersion: this.webVersion
      }
    }
    // SCHEDULE LIST
    const busEvent: BusEvent = {
      ...registerComponentsBase,
      payload: {
        ...registerComponentsBase.payload, 
        ...{ 
        customElementName: 'faq-btn-text',
        customElementInputs: {
          'data-group': 'schedule',
          'data-order_in_group': '1',
          'data-main_order': '1',
          url: `${this._coreService.getRouterPath()}/schedule-list`,
          active: 'purple'
        },
        customElementTransclusion: 'Расписания',
      }},
    };
    this.eventBusPusher(busEvent);
    // SCHEDULE CREATE
    const busEvent2: BusEvent = {
      ...registerComponentsBase,
      payload: {
        ...registerComponentsBase.payload, 
        ...{ 
        customElementName: 'faq-btn-icon', 
        customElementInputs: {
          icon: 'typcn-plus',
          'data-order_in_group': '2',
          'data-group': 'schedule',
          'data-main_order': '1',
          url: `${this._coreService.getRouterPath()}/schedule-create`,
          active: 'purple'
        },
        customElementTransclusion: ''
      }},
    };
    this.eventBusPusher(busEvent2);
    // TICKET LIST
    const busEvent3: BusEvent = {
      ...registerComponentsBase,
      payload: {
        ...registerComponentsBase.payload, 
        ...{ 
        customElementName: 'faq-btn-text',
        customElementInputs: {
          'data-group': 'ticket',
          'data-order_in_group': '1',
          'data-main_order': '2',
          url: `${this._coreService.getRouterPath()}/ticket-list`,
          active: 'purple'
        },
        customElementTransclusion: 'Билеты'
      }},
    };
    this.eventBusPusher(busEvent3);
    // TICKET CREATE
    const busEvent4: BusEvent = {
      ...registerComponentsBase,
      payload: {
        ...registerComponentsBase.payload, 
        ...{ 
        customElementName: 'faq-btn-icon',
        customElementInputs: {
          icon: 'typcn-plus',
          'data-order_in_group': '2',
          'data-group': 'ticket',
          'data-main_order': '2',
          url: `${this._coreService.getRouterPath()}/ticket-create`,
          active: 'purple'
        },
        customElementTransclusion: '',
        url: buildUrl('ticket-create', this._coreService.getRouterPath())
      }},
    };
    this.eventBusPusher(busEvent4);
    // TICKET SHOW
    const busEvent5: BusEvent = {
      ...registerComponentsBase,
      payload: {
        ...registerComponentsBase.payload, 
        ...{ 
        customElementName: 'faq-btn-icon',
        customElementInputs: {
          icon: 'typcn-media-play',
          'data-order_in_group': '0',
          'data-group': 'ticket',
          'data-main_order': '2',
          url: `${this._coreService.getRouterPath()}/ticket`,
          active: 'purple'
        },
        customElementTransclusion: '',
      }},
    };
    this.eventBusPusher(busEvent5);
  }
    
  public registerRemoteButtonElement() {
    const remoteButtonElement1 = createCustomElement(ProductButtonTextComponent, {
      injector: this.injector,
    });
    customElements.define('faq-btn-text', remoteButtonElement1);
    //plus +
    const remoteButtonElement2 = createCustomElement(ProductButtonIconComponent, {
      injector: this.injector,
    });
    customElements.define('faq-btn-icon', remoteButtonElement2);
  }
}