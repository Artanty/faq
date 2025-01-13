import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, forkJoin, map, catchError, Observable } from 'rxjs';
import { Dict } from '../../models/dict.model';
import { Ticket } from '../../models/ticket.model';
import { ApiService } from '../../services/api.service';
import { DeleteWithAnswersRequest, GetSchedulesByUserIdResponseItem } from '../../services/api.service.types';
import { CoreService } from '../../services/core.service';
import { buildUrl, changeLastUrlSegment } from '../../services/route-builder';
import { UserService } from '../../services/user.service';
import { StateName, TicketDetailState } from '../ticket-detail/ticket-detail.component';
import { Location } from '@angular/common';
import { formatDate } from '../../services/helpers';

@Component({
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.component.html',
  styleUrl: './schedule-list.component.scss'
})
export class ScheduleListComponent {
  data: any[] = [];
  StateName = StateName
  state$ = new BehaviorSubject<TicketDetailState>({ name: StateName.LOADING })
  dict: Dict = {
    folders: [],
    topics: [],
  }
  public weekdays: string[] = ['Пн', 'Вт', "Ср", "Чт", "Пт", "Сб", "Вс"]


  constructor(
    private _apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private _userService: UserService,
    private route: ActivatedRoute, 
    // @Inject(EVENT_BUS_PUSHER)
    // private eventBusPusher: (busEvent: BusEvent) => void,
    private router: Router,
    private location: Location,
    private _coreService: CoreService
  ) {}

  ngOnInit(): void {
    this._getItems()
  }
  
  public isWeekdayActive (weekdays: string, i: number): number {
    return +weekdays[i]
  }

  public deleteSchedule (scheduleId: number) {
    this._apiService.deleteSchedule({ id: scheduleId }).subscribe(() => {
      this.data = this.data.filter(el => el.id !== scheduleId)
      this.cdr.detectChanges()
    })
  }

  private _getItems () {
    this.state$.next({ name: StateName.LOADING })
    forkJoin([
      this._loadDictionariesAndProfile(),
      this._getItemsApi()
    ]).pipe(
      map(([dict, data]) => {
        
        this.dict = dict
        this.data = data.map((el: any) => {
          if (el.folderId) {
            el.folderName = dict.folders.find(f => f.id === el.folderId)?.name
          } else {
            el.folderName = "-"
          }
          if (el.topicId) {
            el.topicName = dict.topics.find(f => f.id === el.topicId)?.name
          } else {
            el.topicName = "wfjh9fjh9jir4edff32mk43"
          }
          if (el.dateFrom) {
            el.dateFrom = formatDate(el.dateFrom, { day: true, 
              month: true, 
              year: true }, )
          }
          if (el.dateTo) {
            el.dateTo = formatDate(el.dateTo, { day: true, 
              month: true, 
              year: true }, )
          }
          
          return el
        })
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
  
  private _getItemsApi(): Observable<GetSchedulesByUserIdResponseItem[]> {
    const req = {
      userId: this._userService.getUser()
    }
    return this._apiService.getSchedulesByUserId(req)
  }

  public reload() {
    this._getItems()
  }

  public goBack() {
    this.location.back();
  }

  public goToCreateSchedule() {
    this.router.navigateByUrl(buildUrl(`schedule-create`, this._coreService.getRouterPath()))
  }
}
