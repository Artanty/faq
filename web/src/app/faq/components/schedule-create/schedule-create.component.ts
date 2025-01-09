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
export type PreCreateSchedule = Required<Pick<CreateScheduleRequest, 'weekdays' | 'frequency' | 'folderId' | 'topicId' | 'dateFrom' | 'dateTo'>>
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
    dateFrom: '',
    dateTo: '',
    frequency: 180,
    weekdays: '1111111'
  }

  dict: Dict = {
    folders: [],
    topics: [],
  }
  preDateFrom = 'TODO'
  parentValue: string = '1';
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private _apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private readonly _userService: UserService,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void
  ) {}
  // CreateScheduleRequest
  // createSchedule
  ngOnInit(): void {
    this.state$.next({ name: StateName.LOADING })
    this._loadDictionariesAndProfile()
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

    this._apiService
      .createTicket(rawResult)
      .pipe(
        catchError((e: any) => {
          this.state$.next({ name: StateName.ERROR, payload: e.error.message })
          throw new Error(e)
        })
      )
      .subscribe((res) => {
        this.state$.next({ name: StateName.SUBMITTED })
        this.countdownToClose()
      });
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

  public goToTicketList(): void {
    this.router.navigateByUrl(changeLastUrlSegment(this.router.url, `ticket-list`))
  }

  public clearForm(): void {
    this.form = {
      folderId: 0,
      topicId: 0,
      dateFrom: '',
      dateTo: '',
      frequency: 180,
      weekdays: '1111111'
    }
    this._resetCountdown()
    this.state$.next({ name: StateName.READY })
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
  
}
