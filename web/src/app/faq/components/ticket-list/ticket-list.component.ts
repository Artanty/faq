import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Ticket } from '../../models/ticket.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  // styleUrls: ['./ticket-list.component.css'],
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] | any = [];

  constructor(
    private _apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private _userService: UserService
  ) {}

  ngOnInit(): void {
    const req = {
      userId: this._userService.getUser()
    }
    this._apiService.getTickets(req).subscribe((data: any) => {
      this.tickets = [JSON.stringify(data)];
      console.log(this.tickets)
      this.cdr.detectChanges()
    });

    
  }
}