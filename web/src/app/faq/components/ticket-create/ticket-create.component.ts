import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { UserService } from '../../services/user.service';
import { StateName, TicketDetailState } from '../ticket-detail/ticket-detail.component';
import { CreateTicketRequest } from '../../services/api.service.types';
import { Dict } from '../../models/dict.model';

@Component({
  selector: 'app-ticket-create',
  templateUrl: './ticket-create.component.html',
  styleUrls: ['./ticket-create.component.scss'],
})
export class TicketCreateComponent implements OnInit {
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
    private readonly _userService: UserService
  ) {}

  ngOnInit(): void {
    this.state$.next({ name: StateName.LOADING })
    this._loadDictionariesAndProfile()
  }

  public setState (state: StateName) {
    this.state$.next({ name: state })
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
    if (rawResult.topicId == 0) {
      delete rawResult.topicId
    }
    rawResult.userId = this._userService.getUser()

    console.log(rawResult)
    this._apiService
      .createTicket(rawResult)
      .pipe(
        catchError((e: any) => {
          this.state$.next({ name: StateName.ERROR, payload: e.error.message })
          console.log(e)
          throw new Error(e)
        })
      )
      .subscribe((res) => {
        console.log(res)
        this.state$.next({ name: StateName.SUBMITTED })
        // this.state$.next({ name: StateName.READY })
      });
  }

  private _loadDictionariesAndProfile() {
    this._apiService.getDictionaries().subscribe((res: Dict) => {
      // console.log(res)
      this.dict = res
      const defaultFolder = res.folders.find(el => el.service === 1)
      if (!defaultFolder) {
        throw new Error('no default folder')
      } else {
        this.newTicket.folderId = defaultFolder.id
      }
      this.mock()
      this.state$.next({ name: StateName.READY })
    })
  }

  mock () {
    this.newTicket.question = "Какие типы данных есть в JS?"
    this.newTicket.rightAnswer = "- Число (number)\n - Строка (string)\nБулевый (логический) тип (boolean)\n - BigInt\n - Symbol\n - null\n - undefiend\n - Object"
    this.newTicket.title = "Типы данных"
  }
}
