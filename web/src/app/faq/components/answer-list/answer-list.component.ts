import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, catchError, concatMap, finalize, Observable, tap } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { UserService } from '../../services/user.service';
import { StateName, TicketDetailState } from '../ticket-detail/ticket-detail.component';
import { Answer } from '../../models/answer.model';
import { Ticket } from '../../models/ticket.model';
import { formatTimeDifference } from '../../services/helpers';
import { Location } from '@angular/common';


@Component({
  selector: 'app-answer-list',
  templateUrl: './answer-list.component.html',
  styleUrl: './answer-list.component.scss'
})
export class AnswerListComponent implements OnInit{
  StateName = StateName
  state$ = new BehaviorSubject<TicketDetailState>({ name: StateName.LOADING })
  data: Answer[] = []
  ticketQuestion: string = ''
  constructor(
    private route: ActivatedRoute, 
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private readonly _userService: UserService,
    // @Inject(EVENT_BUS_PUSHER)
    // private eventBusPusher: (busEvent: BusEvent) => void,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    if (this._isTicketIdInUrl) {
      this._getAnswersByTicketId(this._ticketIdFromUrl)
    } else {
      console.log('to do: retrieve all the answers?')
    }
  }

  goBack() {
    this.location.back();
  }

  public reload () {
    if (this._isTicketIdInUrl) {
      this._getAnswersByTicketId(this._ticketIdFromUrl)
    }
  }

  private _getAnswersByTicketId (ticketId: number) {
    this.state$.next({ name: StateName.LOADING })
    this.apiService.getAnswersByTicketId({ ticketId })
      .pipe(
        tap((data) => {
          data = data.map(e => {
            e.date = formatTimeDifference(e.date)
            return e
          })
          
          this.data = data;
        }),
        concatMap(() => {
          return this._getTicketById(this._ticketIdFromUrl)
        }),
        catchError((e: any) => {
          this.state$.next({ name: StateName.ERROR, payload: { raw: JSON.stringify(e), message: e.error.message } })
          throw new Error(e)
        }),
      ).subscribe(() => {
        this.state$.next({ name: StateName.READY })
        this.cdr.detectChanges()
      });
  }

  private _getTicketById (ticketId: number): Observable<Ticket> {
    return this.apiService.getTicketById({ ticketId })
      .pipe(
        tap((data) => {
          this.ticketQuestion = data.question;
        }),
        catchError((e: any) => {
          this.state$.next({ name: StateName.ERROR, payload: { raw: JSON.stringify(e), message: e.error.message } })
          console.log(e)
          throw new Error(e)
        })
      )
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
}
