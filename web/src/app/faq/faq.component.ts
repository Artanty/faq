import { ChangeDetectionStrategy, Component, Inject, InjectionToken, isDevMode, OnInit, Optional, Renderer2, SkipSelf } from "@angular/core";

import { BehaviorSubject, filter, Observable } from "rxjs";
import { BusEvent, EVENT_BUS } from "typlib";
import { ApiService } from "./services/api.service";
import { GetOldestTicketRequest } from "./services/api.service.types";
import { UserService } from "./services/user.service";
import { Router } from "@angular/router";
import { APP_BASE_HREF, PlatformLocation } from "@angular/common";
import { FontInitializerService } from "./services/font-initializer.service";
import { buildUrl } from "./services/route-builder";
import { CoreService } from "./services/core.service";

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
        @Inject('WEBPACK_PUBLIC_PATH')
        private webpack_public_path: string
    ) {}
    
    ngOnInit(): void {
      console.log(this.webpack_public_path) // todo try in build
      this.fontInitializer.initializeFonts();
     
      // console.log('isDevMode(): ' + isDevMode())
      if (isDevMode()) {
        this.router.navigate(['/ticket-list']).catch(() => {
          this.router.navigate(['/faq/ticket-list'])
        })
      }
      this.eventBusListener$.subscribe((res: BusEvent)=>{
        console.log('faq.comp: ' + res.event)
        console.log(res)
        if (res.event === 'SHOW_OLDEST_TICKET') {
          this.router.navigateByUrl(buildUrl('ticket', (res as any).payload?.routerPath))
        }
        if (res.event === 'ROUTER_PATH') {
          this._coreService.setRouterPath((res.payload as any).routerPath)
        }
      })
    }
    
}


