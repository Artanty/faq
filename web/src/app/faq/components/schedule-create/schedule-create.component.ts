import { ChangeDetectorRef, Component, Inject, isDevMode, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, catchError } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { UserService } from '../../services/user.service';
import { StateName, TicketDetailState } from '../ticket-detail/ticket-detail.component';
import { CreateScheduleRequest, CreateTicketRequest } from '../../services/api.service.types';
import { Dict, Folder, Topic } from '../../models/dict.model';
import { BusEvent } from 'typlib';
import { EVENT_BUS_PUSHER } from '../../faq.component';
import { changeLastUrlSegment } from '../../services/route-builder';
import { getDateRangeFromToday } from '../../services/helpers';
export type PreCreateSchedule = Required<Pick<CreateScheduleRequest, 'weekdays' | 'frequency' | 'folderId' | 'topicId' | 'dateFrom' | 'dateTo'>>
export interface PredefinedRange {
  id: string, name: string, dateFrom?: string, dateTo?: string
}
@Component({
  selector: 'app-schedule-create',
  templateUrl: './schedule-create.component.html',
  styleUrl: './schedule-create.component.scss'
})
export class ScheduleCreateComponent implements OnInit {
  countdown: number = 5
  countdownId: any = null
  StateName = StateName
  state$ = new BehaviorSubject<TicketDetailState>({ name: StateName.LOADING })
  form: PreCreateSchedule = {
    folderId: 0,
    topicId: 0,
    dateFrom: null,
    dateTo: null,
    frequency: 180,
    weekdays: '1101101'
  }

  dict: Dict = {
    folders: [],
    topics: [],
  }

  public weekdays: string[] = ['Пн', 'Вт', "Ср", "Чт", "Пт", "Сб", "Вс"]
  
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private _apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private readonly _userService: UserService,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void
  ) {}
  ngOnInit(): void {
    this.state$.next({ name: StateName.LOADING })
    this._loadDictionariesAndProfile()
  }

  public toggleWeekday(i: number) {
    let strArray = this.form.weekdays.split('');

    strArray[i] = strArray[i] === '1'
    ? "0"
    : "1"

    this.form.weekdays = strArray.join('')
  }

  public isWeekdayActive (i: number): number {
    return +this.form.weekdays[i]
  }

  public frequencies: { name: string, value: number }[] = [
    { name: '1 мин.', value: 1 },
    { name: '2 мин.', value: 2 },
    { name: '3 мин.', value: 3 },
    { name: '5 мин.', value: 5 },
    { name: '10 мин.', value: 10 },
    { name: '15 мин.', value: 15 },
    { name: 'пол часа', value: 30 },
    { name: '45 мин.', value: 45 },
    { name: 'час', value: 60 },
    { name: '2 часа', value: 120 },
    { name: '3 часа', value: 180 },
    { name: '4 часа', value: 240 },
  ]

  public setFrequency (data: unknown) {
    this.form.frequency = Number(data)
    this.cdr.detectChanges()
  }

  public isFrequencyActive (item: unknown) {
    return this.form.frequency === Number(item)
  }

  public get isTopicVisible (): boolean {
    const selectedFolder = Number(this.form.folderId)
    return this.dict.folders?.find(el => el.id === selectedFolder)?.service !== 1
  }

  public get availableTopics (): any[] {
    return [
      { id: 0, name: 'Нет темы' },
      ...this.dict['topics']
        .filter(el => el.folderId === Number(this.form.folderId))
    ]
  }

  public onSubmit(): void {
    this.state$.next({ name: StateName.LOADING })

    const rawResult = JSON.parse(JSON.stringify(this.form))
    
    this.validateTopic(rawResult)
    
    rawResult.userId = this._userService.getUser()
    rawResult.active = true
    if (this.serviceFolderId === +rawResult.folderId) {
      delete rawResult.folderId
    }
   
    this._apiService 
      .createSchedule(rawResult)
      .pipe(
        catchError((e: any) => {
          this.state$.next({ name: StateName.ERROR, payload: e.error.message })
          throw new Error(e)
        })
      )
      .subscribe((res) => {
        this.state$.next({ name: StateName.SUBMITTED })
        setTimeout(() => {
          this.goToScheduleList()
        }, 1000)
      });
  }

  public backToForm (): void {
    this.state$.next({ name: StateName.READY })
  }

  public goToScheduleList(): void {
    this.router.navigateByUrl(changeLastUrlSegment(this.router.url, `schedule-list`))
  }

  public clearForm(): void {
    this.form = {
      folderId: 0,
      topicId: 0,
      dateFrom: null,
      dateTo: null,
      frequency: 180,
      weekdays: '1111111'
    }
    this.state$.next({ name: StateName.READY })
  }

  public onDateFromChange(data: string) {
    // todo validate form?
  }
  public onDateToChange(data: string) {
    // todo validate form?
  }

  public predefinedRanges: PredefinedRange[] = [
    { id: 'all', name: 'все' },
    { id: 'this_month_today', name: 'месяц' },
    { id: '1_m_ago', name: 'тот месяц' },
    // { id: '2_m_ago', name: 'прев. 2 мес.' },
    { id: '2_m_ago_today', name: '2 месяца' },
    { id: '3_m_ago_today', name: '3 месяца' },
    { id: 'this_year_today', name: 'год' },
    { id: 'prev_week', name: 'та неделя' },
    { id: 'this_week_today', name: 'эта неделя' },
  ]
  
  private enrichPredefinedRanges () {
    this.predefinedRanges = this.predefinedRanges.map(el => {
      const { startDate, endDate } = JSON.parse(JSON.stringify(getDateRangeFromToday(el.id)))!
      el.dateFrom = startDate
      el.dateTo = endDate
      return el
    })
  }

  public isPredefinedRangeActive (range: PredefinedRange): boolean {
    return range.dateFrom === this.form.dateFrom && range.dateTo === this.form.dateTo
  }

  public setPredefinedRange (range: PredefinedRange) {
    this.form.dateFrom = range.dateFrom || null
    this.form.dateTo = range.dateTo || null
    this.cdr.detectChanges()
  }
  /**
   * delete topic if:
   * - no folder selected
   * - no topic selected
   * - selected topic doesn't belong to selected folder
   */
  private validateTopic (rawResult: any) {
    if (+rawResult.folderId === +this.serviceFolderId){
      delete rawResult.topicId
      this.form.topicId = 0
    }
    if (rawResult.topicId == 0) {
      delete rawResult.topicId
      this.form.topicId = 0
    }
    if (
      rawResult.topicId && 
      +this.getTopicById(rawResult.topicId).folderId !== +rawResult.folderId
    ){
      delete rawResult.topicId
      this.form.topicId = 0
    }
  }

  private getTopicById (topicId: number): Topic {
    const topic = this.dict.topics.find(el => el.id === topicId)
    if (!topic) throw new Error(`no topic with id: ${topicId} found`)
    
    return topic
  }

  /**
   * it is also default folder
   */
  private get serviceFolderId (): number {
    const serviceFolder = this.dict.folders.find(el => el.service === 1)
    if (!serviceFolder) {
      throw new Error('no service folder')
    }

    return serviceFolder.id;
  }

  private _loadDictionariesAndProfile(): void {
    this._apiService.getDictionaries().subscribe((res: Dict) => {
      this.dict = res
      this.form.folderId = this.serviceFolderId
      this.state$.next({ name: StateName.READY })
    })
    this.enrichPredefinedRanges()
  }
}
