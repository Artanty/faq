import { ChangeDetectionStrategy, Component, DestroyRef, inject, Inject, InjectionToken, Injector, isDevMode, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject, combineLatest, filter, forkJoin, Observable, of, Subject, take, takeUntil, tap } from "rxjs";
import { BusEvent, EVENT_BUS } from "typlib";
import { Router } from "@angular/router";
import { FontInitializerService } from "./services/font-initializer.service";
import { buildUrl } from "./services/route-builder";
import { CoreService } from "./services/core.service";
import { OpenerService } from "./services/opener.service";
import { createCustomElement } from "@angular/elements";
import { ButtonComponent } from "./components/button/button.component";

import { ProductButtonTextComponent } from "./components/_remotes/product-button-text.component";
import { ProductButtonIconComponent } from "./components/_remotes/product-button-icon.component";
import { TicketQueueService } from "./services/ticketQueue.service";
import { RegisterComponentsService } from "./services/register-components.service";

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

export class FaqComponent implements OnInit, OnDestroy{
  destroyed = new Subject<void>()
  constructor (
      private router: Router,
      @Inject(EVENT_BUS_LISTENER)
      private readonly eventBusListener$: Observable<BusEvent>,
      private _coreService: CoreService,
      private _registerComponentsService: RegisterComponentsService,
      private fontInitializer: FontInitializerService,
      private _openerService: OpenerService,
      @Inject(EVENT_BUS_PUSHER)
      private readonly eventBusPusher: (busEvent: BusEvent) => void,
      private _ticketQueueService: TicketQueueService,
      @Inject('WEB_VERSION') private readonly webVersion: string
  ) {
    this.eventBusListener$.pipe(
      takeUntil(this.destroyed)
    ).subscribe((res: BusEvent)=>{
      console.log('faq.comp saw event: ' + res.event)
      // console.log(res)
      if (res.event === 'SHOW_OLDEST_TICKET') { 
        if (res.payload.tickets && Array.isArray(res.payload.tickets) && res.payload.tickets.length) {
          this._ticketQueueService.pushToQueue(res.payload.tickets)
          this.router.navigateByUrl(buildUrl('ticket', this._coreService.getRouterPath()))
        } else {
          this._openerService.maybeOpenModal()
        }
      }
    })
  }
  
  ngOnInit(): void {
    combineLatest([
      this._routerPathSet$(),
      this._registerComponentsService.listenComponentsRegistered$().pipe(
        filter((res: boolean) => res === true)
      )
    ]).pipe(
      takeUntil(this.destroyed)
    ).subscribe(() => {
      this._renderComponents()
    })
  }

  private _routerPathSet$ (): Observable<boolean> {
    if (this._coreService.isRouterPathSet() === true) {
      return of(true)
    }
    this.eventBusPusher({
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `${process.env['PROJECT_ID']}@web-host`,
      event: 'ASK_ROUTER_PATH',
      payload: {
        projectId: `${process.env['PROJECT_ID']}`
      }
    })
    return this._coreService.listenRouterPathSet$.pipe(
      filter((res: boolean) => res === true),
      take(1),
      takeUntil(this.destroyed)
    )
  }

  private _renderComponents (): void {
    /**
     * Навигационные кнопки уже сохранены в host'е при подгрузке модуля.
     * Если этот рутовый продуктовый компонент инициализировался,
     * значит мы перешли на продуктовый роут,
     * значит нужно отрисовать навигационные кнопки.
     */
    this.eventBusPusher({
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: `${process.env['PROJECT_ID']}@web-host`,
      event: 'RENDER_COMPONENTS',
      payload: {
        payloadFilter: {
          componentType: 'PRODUCT_BUTTONS',
        }
      }
    })
    // console.log('faq.comp ini VERSION: ' + this.webVersion)
    this.fontInitializer.initializeFonts();
        // console.log('fqa comp init')
  }

  ngOnDestroy (): void {
    console.log('faq destroyed')
    this.destroyed.next();
    this.destroyed.complete();
  }
}


