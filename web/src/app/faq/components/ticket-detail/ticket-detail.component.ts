import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Ticket } from '../../models/ticket.model';
import { Answer } from '../../models/answer.model';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  // styleUrls: ['./ticket-detail.component.css'],
})
export class TicketDetailComponent implements OnInit {
  ticket: Ticket | null = null;
  answers: Answer[] = [];
  newAnswer = { body: '', rate: 1 };

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.apiService.getTicketById(id).subscribe((data) => {
      this.ticket = data;
    });
    this.apiService.getAnswersByTicketId(id).subscribe((data) => {
      this.answers = data;
    });
  }

  onSubmit(): void {
    if (this.ticket) {
      this.apiService
        .submitAnswer({ ticketId: this.ticket.id, ...this.newAnswer })
        .subscribe((data) => {
          this.answers.push(data);
          this.newAnswer = { body: '', rate: 1 };
        });
    }
  }
}