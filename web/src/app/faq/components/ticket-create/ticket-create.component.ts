import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { UserService } from '../../services/user.service';
import { StateName, TicketDetailState } from '../ticket-detail/ticket-detail.component';
import { CreateTicketRequest } from '../../services/api.service.types';
import { Dict, Folder, Topic } from '../../models/dict.model';
import { BusEvent } from 'typlib';
import { EVENT_BUS_PUSHER } from '../../faq.component';

@Component({
  selector: 'app-ticket-create',
  templateUrl: './ticket-create.component.html',
  styleUrls: ['./ticket-create.component.scss'],
})
export class TicketCreateComponent implements OnInit {
  countdown: number = 5
  countdownId: any = null
  StateName = StateName
  state$ = new BehaviorSubject<TicketDetailState>({ name: StateName.LOADING })
  newTicket: CreateTicketRequest = {
    title: '',
    question: '',
    rightAnswer: '',
    folderId: 0,
    topicId: 0
  }
  dict: Dict = {
    folders: [],
    topics: [],
  }
  constructor(
    private route: ActivatedRoute, 
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

  public get isTopicVisible (): boolean {
    const selectedFolder = Number(this.newTicket.folderId)
    return this.dict.folders?.find(el => el.id === selectedFolder)?.service !== 1
  }

  public get availableTopics (): any[] {
    return this.dict['topics'].filter(el => el.folderId === Number(this.newTicket.folderId))
  }

  public onSubmit(): void {
    this.state$.next({ name: StateName.LOADING })

    const rawResult = JSON.parse(JSON.stringify(this.newTicket))
    
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

  public closeExtension() {
    const closeExtBusEvent: BusEvent = {
      event: "CLOSE_EXT",
      from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
      to: "",
      payload: {}
    }
    this.eventBusPusher(closeExtBusEvent)
  }

  public backToForm () {
    this._resetCountdown()
    this.state$.next({ name: StateName.READY })
  }

  public clearForm() {
    this.newTicket = {
      title: '',
      question: '',
      rightAnswer: '',
      folderId: this.serviceFolderId,
      topicId: 0
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
  private validateTopic (rawResult: CreateTicketRequest) {
    if (+rawResult.folderId === +this.serviceFolderId){
      delete rawResult.topicId
      this.newTicket.topicId = 0
    }
    if (rawResult.topicId == 0) {
      delete rawResult.topicId
      this.newTicket.topicId = 0
    }
    if (
      rawResult.topicId && 
      +this.getTopicById(rawResult.topicId).folderId !== +rawResult.folderId
    ){
      delete rawResult.topicId
      this.newTicket.topicId = 0
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

  private _loadDictionariesAndProfile() {
    this._apiService.getDictionaries().subscribe((res: Dict) => {
      this.dict = res
      this.newTicket.folderId = this.serviceFolderId
      // this.mock()
      this.state$.next({ name: StateName.READY })
      // this.state$.next({ name: StateName.SUBMITTED })
      // this.countdownToClose()
    })
  }

  private countdownToClose () {
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

  private _resetCountdown () {
    clearInterval(this.countdownId)
    this.countdownId = null  
  }

  mock () {
    this.newTicket.question = "Какие типы данных есть в JS?"
    this.newTicket.rightAnswer = "- Число (number)\n - Строка (string)\nБулевый (логический) тип (boolean)\n - BigInt\n - Symbol\n - null\n - undefiend\n - Object"
    this.newTicket.title = "Типы данных"
  }
}
