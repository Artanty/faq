import { ChangeDetectionStrategy, Component, Inject, InjectionToken, Injector, isDevMode, OnInit } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { BusEvent, EVENT_BUS } from "typlib";
import { Router } from "@angular/router";
import { FontInitializerService } from "./services/font-initializer.service";
import { buildUrl } from "./services/route-builder";
import { CoreService } from "./services/core.service";
import { OpenerService } from "./services/opener.service";
import { createCustomElement } from "@angular/elements";
import { ButtonComponent } from "./components/button/button.component";

import { ProductButtonTextComponent } from "./components/_remotes/product-button-add/product-button-text.component";
import { ProductButtonIconComponent } from "./components/_remotes/product-button-add/product-button-icon.component";

export const EVENT_BUS_LISTENER = new InjectionToken<Observable<BusEvent>>('');
export const EVENT_BUS_PUSHER = new InjectionToken<
  (busEvent: BusEvent) => void
>('');

@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrl: './faq.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
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

export class FaqComponent implements OnInit{
  
    constructor (
        private router: Router,
        @Inject(EVENT_BUS_LISTENER)
        private readonly eventBusListener$: Observable<BusEvent>,
        private _coreService: CoreService,
        private fontInitializer: FontInitializerService,
       
        private _openerService: OpenerService,
        @Inject(EVENT_BUS_PUSHER)
        private readonly eventBusPusher: (busEvent: BusEvent) => void,
        private injector: Injector
    ) {}
    
    ngOnInit(): void {
      
      this.fontInitializer.initializeFonts();
     
      // console.log('isDevMode(): ' + isDevMode())
      
      this.eventBusListener$.subscribe((res: BusEvent)=>{
        console.log('faq.comp: ' + res.event)
        console.log(res)
        if (res.event === 'SHOW_OLDEST_TICKET') {
          this.router.navigateByUrl(buildUrl('ticket', (res as any).payload?.routerPath))
        }
        if (res.event === 'ROUTER_PATH') {
          this._coreService.setRouterPath((res.payload as any).routerPath)
          this.shareComponentsWithHost()
        }
      })

      if (isDevMode()) { 
        // console.log(buildUrl('schedule-create', this._coreService.getRouterPath()))
        this.router.navigateByUrl(buildUrl('schedule-list', this._coreService.getRouterPath()))
        .catch(() => {
          console.log('BAD')
        })
        this._openerService.maybeOpenModal()
      }
    }

    shareComponentsWithHost() {
      this.registerRemoteButtonElement()
      const registerComponentsBase = {
        from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
        to: `${process.env['PROJECT_ID']}@web-host`,
        event: 'REGISTER_COMPONENTS',
      }
      // SCHEDULE LIST
      const busEvent: BusEvent = {
        ...registerComponentsBase,
        payload: { 
          componentType: 'PRODUCT_BUTTON',
          customElementName: 'faq-btn-text',
          customElementInputs: {
           'data-group': 'schedule',
           'data-order_in_group': '1',
           'data-main_order': '1',
           url: 'schedule-list',
           active: 'purple'
          },
          customElementTransclusion: 'Расписания',
        },
      };
      this.eventBusPusher(busEvent);
      // SCHEDULE CREATE
      const busEvent2: BusEvent = {
        ...registerComponentsBase,
        payload: { 
          componentType: 'PRODUCT_BUTTON',
          customElementName: 'faq-btn-icon', 
          customElementInputs: {
            icon: 'typcn-plus',
            'data-order_in_group': '2',
            'data-group': 'schedule',
            'data-main_order': '1',
            url: 'schedule-create',
            active: 'purple'
          },
          customElementTransclusion: ''
        },
      };
      this.eventBusPusher(busEvent2);
      // TICKET LIST
      const busEvent3: BusEvent = {
        ...registerComponentsBase,
        payload: { 
          componentType: 'PRODUCT_BUTTON',
          customElementName: 'faq-btn-text',
          customElementInputs: {
           'data-group': 'ticket',
           'data-order_in_group': '1',
           'data-main_order': '2',
           url: 'ticket-list',
           active: 'purple'
          },
          customElementTransclusion: 'Билеты'
        },
      };
      this.eventBusPusher(busEvent3);
      // TICKET CREATE
      const busEvent4: BusEvent = {
        ...registerComponentsBase,
        payload: {
          componentType: 'PRODUCT_BUTTON',
          customElementName: 'faq-btn-icon',
          customElementInputs: {
            icon: 'typcn-plus',
            'data-order_in_group': '2',
            'data-group': 'ticket',
            'data-main_order': '2',
            url: 'ticket-create',
            active: 'purple'
          },
          customElementTransclusion: '',
          url: buildUrl('ticket-create', this._coreService.getRouterPath())
        },
      };
      this.eventBusPusher(busEvent4);
      // TICKET SHOW
      const busEvent5: BusEvent = {
        ...registerComponentsBase,
        payload: {
          componentType: 'PRODUCT_BUTTON',
          customElementName: 'faq-btn-icon',
          customElementInputs: {
            icon: 'typcn-media-play',
            'data-order_in_group': '0',
            'data-group': 'ticket',
            'data-main_order': '2',
            url: 'ticket',
            active: 'purple'
          },
          customElementTransclusion: '',
        },
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


