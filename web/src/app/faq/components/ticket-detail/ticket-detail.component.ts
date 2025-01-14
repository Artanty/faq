import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Ticket } from '../../models/ticket.model';
import { Answer, AnswerSaveResponse } from '../../models/answer.model';
import { BehaviorSubject, catchError, concatMap, map, Observable, take, tap } from 'rxjs';
import { DeleteWithAnswersRequest, GetOldestTicketRequest } from '../../services/api.service.types';
import { UserService } from '../../services/user.service';
import { BusEvent } from 'typlib';
import { EVENT_BUS_PUSHER } from '../../faq.component';
import { buildUrl, changeLastUrlSegment } from '../../services/route-builder';
import { CoreService } from '../../services/core.service';
import { QueueState, TicketQueueService } from '../../services/ticketQueue.service';

export enum StateName {
  LOADING = 'LOADING',
  READY = 'READY',
  ERROR = 'ERROR',
  SUBMITTED = 'SUBMITTED',
}
export interface TicketDetailState {
  name: StateName, 
  payload?: any
}
export interface TicketDetailAnswerDTO {
  body: string
}
const ticketDetailAnswerDTODefault = () => ({ 
  body: '',
  rightAnswer: ''
})

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss'],
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  countdown: number = 5
  countdownId: any = null
  StateName = StateName
  state$ = new BehaviorSubject<TicketDetailState>({ name: StateName.LOADING })
  ticket: Ticket | null = null;
  answer: TicketDetailAnswerDTO = ticketDetailAnswerDTODefault();
  currentSide: 'front' | 'back' = 'front'
  postSubmit: boolean = false
  postSubmitError: boolean = false
  queueState$: Observable<QueueState>

  constructor(
    private route: ActivatedRoute, 
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private readonly _userService: UserService,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    private router: Router,
    private _coreService: CoreService,
    private _ticketQueueService: TicketQueueService
  ) {
    this.queueState$ = this._ticketQueueService.listenQueueState()
  }

  ngOnInit(): void {
    if (this._isTicketIdInUrl) {
      this._getTicketById(this._ticketIdFromUrl)
    } else {
      this._getOldestTicket().subscribe()
    }
  }

  ngOnDestroy(): void {
    this._resetCountdown()
  }

  public onSubmit(): void {
    if (this.ticket) {
      this.state$.next({ name: StateName.LOADING })
      this.apiService
        .submitAnswer({ ticketId: this.ticket.id, ...this.answer, userId: this.ticket.userId, rate: 1 })
        .pipe(
          catchError((e: any) => {
            this.state$.next({ name: StateName.ERROR, payload: { raw: JSON.stringify(e), message: e.error.message } })
            console.log(e)
            throw new Error(e)
          })
        )
        .subscribe((res: AnswerSaveResponse) => {
          this.ticket = null
          this.answer = ticketDetailAnswerDTODefault();
          this._ticketQueueService.removeTicketFromQueue(res.ticketId)
          const ticketsLeft = this._ticketQueueService.getQueueState().all

          if (!ticketsLeft) {
            this.state$.next({ name: StateName.SUBMITTED })
            this.countdownToClose()
          } else {
            this._ticketQueueService.nextTicket()
            this._getOldestTicket().subscribe()
            this.state$.next({ name: StateName.READY })
          }
        });
    }
  }

  public closeExtension(): void {
      const closeExtBusEvent: BusEvent = {
        event: "CLOSE_EXT",
        from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
        to: "",
        payload: {}
      }
      this.eventBusPusher(closeExtBusEvent)
    }

  public backToForm (): void {
    this._resetCountdown()
    this.state$.next({ name: StateName.READY })
  }

  public nextTicket() {
    this._ticketQueueService.skipTicket()
    this._getOldestTicket().subscribe()
  }

  public showNextTicket() {
    this._resetCountdown()
    this._getOldestTicket().subscribe()
  }

  public deleteWithAnswersAndLoadOldest() {
    if (!this.ticket) throw new Error('no ticket to get id')
    const req: DeleteWithAnswersRequest = {
      ticketId: this.ticket.id
    }
    this.apiService.deleteWithAnswers(req).pipe(
      concatMap(() => {
        return this._getOldestTicket()
      })
    ).subscribe(res => console.log(res))
  }
  
  private countdownToClose (): void {
    this.countdown = this._userService.getCloseCountdown()
    this.countdownId = setInterval(() => {
      this.countdown--
      this.cdr.detectChanges()
      if (!this.countdown) {
        this._resetCountdown()
        this.closeExtension()
      }
    }, 1000)
  }

  private _resetCountdown (): void {
    clearInterval(this.countdownId)
    this.countdownId = null  
  }

  private _getOldestTicket (): Observable<Ticket> {
    this.state$.next({ name: StateName.LOADING })
    this.ticket = null
    this.answer = ticketDetailAnswerDTODefault();
    this.cdr.detectChanges()
    return this._ticketQueueService.listenQueue()
      .pipe(
        take(1),
        tap((data) => {
          console.log(data)
          this.ticket = data;
          this.state$.next({ name: StateName.READY })
          this.cdr.detectChanges()
        }),
        catchError((e: any) => {
          this.state$.next({ name: StateName.ERROR, payload: { raw: JSON.stringify(e), message: e.error.message } })
          console.log(e)
          throw new Error(e)
        })
      )
  }

  private _getTicketById (ticketId: number) {
    this.state$.next({ name: StateName.LOADING })
    this.apiService.getTicketById({ ticketId })
      .pipe(
        catchError((e: any) => {
          this.state$.next({ name: StateName.ERROR, payload: { raw: JSON.stringify(e), message: e.error.message } })
          console.log(e)
          throw new Error(e)
        })
      )
      .subscribe((data) => {
        this.ticket = data;
        this.state$.next({ name: StateName.READY })
        this.cdr.detectChanges()
      });
  }

  private get _ticketIdFromUrl(): number {
    let ticketId
    ticketId = +this.route.snapshot.paramMap.get('id')!
    if (isNaN(ticketId) || ticketId === 0) {
      throw new Error('Wrong format or no ticketId')
    }
      
    return ticketId
  }

  private get _isTicketIdInUrl(): boolean {
    return !!this.route.snapshot.paramMap.get('id')
  }

  public goToAnswerList () {
    this._resetCountdown()
    if (this.ticket?.id) {
      this.router.navigateByUrl(buildUrl(`answer-list/${this.ticket.id}`, this._coreService.getRouterPath()))
    }
  }
  
  public goToTicketList(): void {
    this._resetCountdown()
    this.router.navigateByUrl(buildUrl(`ticket-list`, this._coreService.getRouterPath()))
  }

  public showCorrectAnswer () {
    console.log(this.currentSide)
    this.currentSide = this.currentSide === 'front' ? 'back' : 'front'; // Toggle the side
  }
}