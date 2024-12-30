import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Ticket } from '../../models/ticket.model';
import { Answer } from '../../models/answer.model';
import { BehaviorSubject, catchError } from 'rxjs';
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
  StateName = StateName
  state$ = new BehaviorSubject<TicketDetailState>({ name: StateName.LOADING })
  ticket: Ticket | null = null;
  newAnswer = { body: '', rate: 1 };
  loading: boolean = true
  postSubmit: boolean = false
  postSubmitError: boolean = false

  constructor(
    private route: ActivatedRoute, 
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.state$.next({ name: StateName.LOADING })
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.apiService.getTicketById(id)
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

  onSubmit(): void {
    if (this.ticket) {
      this.state$.next({ name: StateName.LOADING })
      this.apiService
        .submitAnswer({ ticketId: this.ticket.id, ...this.newAnswer })
        .pipe(
          catchError((e: any) => {
            this.state$.next({ name: StateName.ERROR, payload: JSON.stringify(e) })
            console.log(e)
            throw new Error(e)
          })
        )
        .subscribe((data) => {
          this.newAnswer = { body: '', rate: 1 };
          this.state$.next({ name: StateName.SUBMITTED })
        });
    }
  }
}