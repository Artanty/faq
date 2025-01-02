import { ChangeDetectionStrategy, Component, Inject, InjectionToken, OnInit, Optional, SkipSelf } from "@angular/core";

import { BehaviorSubject, filter, Observable } from "rxjs";
import { BusEvent, EVENT_BUS } from "typlib";

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
      // @Optional() @SkipSelf() @Inject(EVENT_BUS) private eb: BehaviorSubject<BusEvent>,
        // @Inject(EVENT_BUS) private eb: BehaviorSubject<BusEvent>,
        // private router: Router,
        @Inject(EVENT_BUS_LISTENER)
        private readonly eventBusListener$: Observable<BusEvent>,
        // @Inject(EVENT_BUS_PUSHER)
        // private eventBusPusher: (busEvent: BusEvent) => void
    ) {
      // this.eb.subscribe(res=> console.log(res))
      
    }

    ngOnInit(): void {
      // this.router.navigate)
      this.eventBusListener$.subscribe(res=>console.log(res))
    }
    
}