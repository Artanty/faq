import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Ticket } from '../../models/ticket.model';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  // styleUrls: ['./ticket-list.component.css'],
})
export class TicketListComponent implements OnInit {
  tickets: Ticket[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getTickets().subscribe((data) => {
      this.tickets = data;
    });
  }
}