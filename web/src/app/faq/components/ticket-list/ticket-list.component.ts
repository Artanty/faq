import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Ticket } from '../../models/ticket.model';
import { UserService } from '../../services/user.service';
import { BehaviorSubject, catchError, forkJoin, map, Observable, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { StateName, TicketDetailState } from '../ticket-detail/ticket-detail.component';
import { Location } from '@angular/common';
import { Dict } from '../../models/dict.model';
import { DeleteWithAnswersRequest } from '../../services/api.service.types';
import { CoreService } from '../../services/core.service';
import { buildUrl, changeLastUrlSegment } from '../../services/route-builder';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss'],
})
export class TicketListComponent implements OnInit {
  data: Ticket[] | any = [];
  StateName = StateName
  state$ = new BehaviorSubject<TicketDetailState>({ name: StateName.LOADING })
  dict: Dict = {
    folders: [],
    topics: [],
  }

  constructor(
    private _apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private _userService: UserService,
    private router: Router,
    private location: Location,
    private _coreService: CoreService
  ) {}

  ngOnInit(): void {
    this._getTickets()
  }

  private _getTickets () {
    this.state$.next({ name: StateName.LOADING })
    forkJoin([
      this._loadDictionariesAndProfile(),
      this._getTicketsApi()
    ]).pipe(
      map(([dict, data]) => {
        this.dict = dict
        this.data = data;
      }),
      catchError((e: any) => {
        this.state$.next({ name: StateName.ERROR, payload: { raw: JSON.stringify(e), message: e.error.message } })
        throw new Error(e)
      }),
    ).subscribe(() => {
      this.state$.next({ name: StateName.READY })
      this.cdr.detectChanges()
    })
  }

  private _loadDictionariesAndProfile(): Observable<Dict> {
    return this._apiService.getDictionaries()
  }
  
  private _getTicketsApi() {
    const req = {
      userId: this._userService.getUser()
    }
    return this._apiService.getTickets(req)
  }

  public reload() {
    this._getTickets()
  }

  public goBack() {
    this.location.back();
  }

  public goToTicket(ticketId: number) {
    this.router.navigateByUrl(buildUrl(`ticket/${ticketId}`, this._coreService.getRouterPath()))
  }

  public deleteWithAnswers(ticketId: number) {
    console.log(ticketId)
    this.state$.next({ name: StateName.LOADING })
    if (!ticketId) {
      this.state$.next({ name: StateName.ERROR, payload: { raw: '', message: 'no ticket id to delete' } })
      throw new Error('no ticket id to delete')
    }

    const req: DeleteWithAnswersRequest = {
      ticketId: ticketId
    }
    this._apiService.deleteWithAnswers(req)
    .pipe(
      catchError((e: any) => {
        this.state$.next({ name: StateName.ERROR, payload: { raw: JSON.stringify(e), message: e.error.message } })
        throw new Error(e)
      }),
    )
    .subscribe(res => {
      console.log(res)
      this.data = this.data.filter((el: Ticket) => el.id !== ticketId)
      this.state$.next({ name: StateName.READY })
    })
  }
}