import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Ticket } from '../../models/ticket.model';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  // styleUrls: ['./ticket-list.component.css'],
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] | any = [];

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.apiService.getTickets().subscribe((data: any) => {
      this.tickets = [JSON.stringify(data)];
      console.log(this.tickets)
      this.cdr.detectChanges()
    });

    
  }
}