import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Ticket } from '../../models/ticket.model';
import { Answer } from '../../models/answer.model';
import { BehaviorSubject, catchError } from 'rxjs';
import { GetOldestTicketRequest } from '../../services/api.service.types';
import { UserService } from '../../services/user.service';
import { BusEvent } from 'typlib';
import { EVENT_BUS_PUSHER } from '../../faq.component';
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
@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss'],
})
export class TicketDetailComponent implements OnInit {
  countdown: number = 5
  countdownId: any = null
  StateName = StateName
  state$ = new BehaviorSubject<TicketDetailState>({ name: StateName.LOADING })
  ticket: Ticket | null = null;
  newAnswer = { body: '', rate: 1 };
  
  postSubmit: boolean = false
  postSubmitError: boolean = false

  constructor(
    private route: ActivatedRoute, 
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private readonly _userService: UserService,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void
  ) {}

  ngOnInit(): void {
    if (this._isTicketIdInUrl) {
      this._getTicketById(this._ticketId)
    } else {
      this._getOldestTicket()
    }
  }

  public onSubmit(): void {
    if (this.ticket) {
      this.state$.next({ name: StateName.LOADING })
      this.apiService
        .submitAnswer({ ticketId: this.ticket.id, ...this.newAnswer, userId: this.ticket.userId })
        .pipe(
          catchError((e: any) => {
            this.state$.next({ name: StateName.ERROR, payload: JSON.stringify(e) })
            console.log(e)
            throw new Error(e)
          })
        )
        .subscribe((data) => {
          this.state$.next({ name: StateName.SUBMITTED })
          this.countdownToClose()
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

  public showNextTicket() {
    this._resetCountdown()
    this._getOldestTicket()
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

  private _getOldestTicket () {
    this.state$.next({ name: StateName.LOADING })
    const req: GetOldestTicketRequest = {
      userId: this._userService.getUser(),
      // folderId: 1,
      // topicId: 1,
      quantity: 1,
    }
    if (req.quantity !== 1) throw new Error('wrong req params for this component')
    this.apiService.getOldestTicket(req)
      .pipe(
        catchError((e: any) => {
          this.state$.next({ name: StateName.ERROR, payload: JSON.stringify(e) })
          console.log(e)
          throw new Error(e)
        })
      )
      .subscribe((data) => {
        this.ticket = data[0];
        console.log(data)
        this.state$.next({ name: StateName.READY })
        this.cdr.detectChanges()
      });
  }

  private _getTicketById (ticketId: number) {
    this.state$.next({ name: StateName.LOADING })
    this.apiService.getTicketById({ ticketId })
      .pipe(
        catchError((e: any) => {
          this.state$.next({ name: StateName.ERROR, payload: JSON.stringify(e) })
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

  private get _ticketId(): number {
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
}