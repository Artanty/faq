import { ChangeDetectionStrategy, Component, Inject, InjectionToken, Injector, isDevMode, OnInit } from "@angular/core";
import { registerRemoteButtonComponent } from './components/_remotes/product-button.remote';
import { BehaviorSubject, Observable } from "rxjs";
import { BusEvent, EVENT_BUS } from "typlib";
import { Router } from "@angular/router";
import { FontInitializerService } from "./services/font-initializer.service";
import { buildUrl } from "./services/route-builder";
import { CoreService } from "./services/core.service";
import { OpenerService } from "./services/opener.service";
import { createCustomElement } from "@angular/elements";
import { ProductButtonRemote3Component } from "./components/_remotes/product-button/product-button.component";

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
      registerRemoteButtonComponent();
      this.registerRemoteButtonElement()
      const busEvent: BusEvent = {
        from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
        to: `${process.env['PROJECT_ID']}@web-host`,
        event: 'REGISTER_COMPONENTS',
        payload: { 
          componentType: 'PRODUCT_BUTTON',
          customElementName: 'remote-product-button-faq2',
          url: buildUrl('schedule-list', this._coreService.getRouterPath())
        },
      };
      this.eventBusPusher(busEvent);
    }
    
    public registerRemoteButtonElement() {
      // Convert the Angular component to a custom element
      const remoteButtonElement = createCustomElement(ProductButtonRemote3Component, {
        injector: this.injector,
      });
  
      // Register the custom element with the browser
      customElements.define('remote-product-button-faq2', remoteButtonElement);
    }
}


