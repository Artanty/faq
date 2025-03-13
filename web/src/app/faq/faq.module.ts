import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Injector, Inject } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { TicketDetailComponent } from "./components/ticket-detail/ticket-detail.component";
import { TicketListComponent } from "./components/ticket-list/ticket-list.component";
import { EVENT_BUS_LISTENER, FaqComponent } from "./faq.component";
import { TicketCreateComponent } from './components/ticket-create/ticket-create.component';
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
import { BehaviorSubject, filter, Observable, take, tap } from "rxjs";
import { BusEvent, EVENT_BUS, EVENT_BUS_PUSHER } from "typlib";
import { createCustomElement } from "@angular/elements";
import { WellComponent } from './components/well/well.component';
import { RegisterComponentsService } from "./services/register-components.service";

export const CHILD_ROUTES = [
    {
      path: '',
      component: FaqComponent,
      children: [
        {
          path: '', component: WellComponent
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
        ProductButtonTextComponent,
        WellComponent
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
      RegisterComponentsService,
      TicketQueueService,
      { 
        provide: EVENT_BUS_LISTENER, 
        useFactory: (eventBus$: BehaviorSubject<BusEvent>) => {
          return eventBus$
            .asObservable()
            .pipe(
              filter((res: BusEvent) => {
                return res.to === `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`
              }),
              tap(res => {
                console.log('faq module saw event: ' + res.event)
              })
            );
        },
        deps: [EVENT_BUS], 
      },
      { 
        provide: 'ROUTER_PATH_DONE', 
        useFactory: (eventBus$: Observable<BusEvent>) => {
          return eventBus$
          .pipe(
            filter((res: BusEvent) => {
              return res.to === `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}` &&
                res.event === 'ROUTER_PATH'
            }),
            take(1)
          )
        },
        deps: [EVENT_BUS_LISTENER], 
      },
      { 
        provide: 'REGISTER_COMPONENTS_DONE',
        useFactory: (eventBus$: Observable<BusEvent>) => {
          return eventBus$
          .pipe(
            filter((res: BusEvent) => {
              return res.to === `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}` &&
                res.event === 'REGISTER_COMPONENTS_DONE'
            }),
            take(1)
          )
        },
        deps: [EVENT_BUS_LISTENER], 
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
    @Inject('ROUTER_PATH_DONE')
    private readonly routerPathDone$: Observable<BusEvent>,
    
    @Inject(EVENT_BUS_PUSHER)
    private readonly eventBusPusher: (busEvent: BusEvent) => void,
    private _coreService: CoreService,
    private _registerComponentsService: RegisterComponentsService,
    private injector: Injector,
    @Inject('WEB_VERSION') private readonly webVersion: string
  ) {
    console.log('Faq module constructor')
    this.eventBusListener$.subscribe((res: BusEvent) => {
      if (res.event === 'ROUTER_PATH') {
        this._coreService.setRouterPath((res.payload as any).routerPath).then(() => {
          this._sendDoneEvent(res, 'self')
        })
      }
      if (res.event === 'REGISTER_COMPONENTS_DONE') {
        this._registerComponentsService.setComponentsRegistered(true)
      }
    })
    this.routerPathDone$.subscribe(res => {
      console.log('ROUTER_PATH RECEIVED, START COMPONENTS REGISTER')
      this._registerComponents()
    })
  }
  ngDoBootstrap() {}
  
  private _registerComponents() {
    this._registerCustomElements()
    const registerComponentsBusEvent = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `${process.env['PROJECT_ID']}@web-host`,
      event: 'REGISTER_COMPONENTS',
      payload: {
        componentType: 'PRODUCT_BUTTONS',
        items: [
          {
            componentType: 'PRODUCT_BUTTON',
            customElementName: 'faq-btn-text',
            customElementInputs: {
              'data-group': 'schedule',
              'data-order_in_group': '1',
              'data-main_order': '1',
              url: `${this._coreService.getRouterPath()}/schedule-list`,
              active: 'purple'
            },
            customElementTransclusion: 'Расписания',
          },
          {
            componentType: 'PRODUCT_BUTTON',
            customElementName: 'faq-btn-icon', 
            customElementInputs: {
              icon: 'typcn-plus',
              'data-order_in_group': '2',
              'data-group': 'schedule',
              'data-main_order': '1',
              url: `${this._coreService.getRouterPath()}/schedule-create`,
              active: 'purple'
            },
            customElementTransclusion: '',
          },
          {
            componentType: 'PRODUCT_BUTTON', 
            customElementName: 'faq-btn-text',
            customElementInputs: {
              'data-group': 'ticket',
              'data-order_in_group': '1',
              'data-main_order': '2',
              url: `${this._coreService.getRouterPath()}/ticket-list`,
              active: 'purple'
            },
            customElementTransclusion: 'Билеты',
          },
          {
            componentType: 'PRODUCT_BUTTON', 
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
          },
          {
            componentType: 'PRODUCT_BUTTON', 
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
          }
        ]
      }
    }
    this.eventBusPusher(registerComponentsBusEvent)
  }  
    
  private _registerCustomElements() {
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

  private _sendDoneEvent(busEvent: BusEvent, to?: string): void {
    const doneBusEvent: BusEvent = {
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: to === 'self' 
        ? `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`
        : `${busEvent.from}`,
      event: `${busEvent.event}_DONE`,
      payload: null
    }
    this.eventBusPusher(doneBusEvent)
  }
}


