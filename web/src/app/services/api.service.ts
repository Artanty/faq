import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';
import { Answer } from '../models/answer.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3266';

  constructor(private http: HttpClient) {}

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/tickets`);
  }

  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/tickets/${id}`);
  }

  createTicket(ticket: { title: string; question: string; rightAnswer: string }): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.baseUrl}/tickets`, ticket);
  }

  getAnswersByTicketId(ticketId: number): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.baseUrl}/answers/ticket/${ticketId}`);
  }

  submitAnswer(answer: { ticketId: number; body: string; rate: number }): Observable<Answer> {
    return this.http.post<Answer>(`${this.baseUrl}/answers`, answer);
  }
}