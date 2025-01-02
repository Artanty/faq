import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';
import { Answer } from '../models/answer.model';
import { CreateTicketRequest, GetOldestTicketRequest, GetOldestTicketResponse, GetTicketByIdRequest, GetUserTicketsRequest } from './api.service.types';
import { Dict } from '../models/dict.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // private baseUrl = 'http://localhost:3266';
  private baseUrl = process.env['FAQ_BACK_URL']
  

  constructor(private http: HttpClient) {}

  getTickets(data: GetUserTicketsRequest): Observable<Ticket[]> {
    return this.http.post<Ticket[]>(`${this.baseUrl}/tickets/all`, data);
  }

  getTicketById(data: GetTicketByIdRequest): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.baseUrl}/tickets/one`, data);
  }

  createTicket(data: CreateTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.baseUrl}/tickets/create`, data);
  }

  getAnswersByTicketId(ticketId: number): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.baseUrl}/answers/ticket/${ticketId}`);
  }

  submitAnswer(answer: { ticketId: number; body: string; rate: number, userId: number }): Observable<Answer> {
    return this.http.post<Answer>(`${this.baseUrl}/answers/save`, answer);
  }

  getOldestTicket (data: GetOldestTicketRequest): Observable<GetOldestTicketResponse[]> {
    if (!(data !== null && typeof data === 'object' && Object.keys(data).length && Object.values(data).every(Number))) {
      throw new Error('apiService.getOldestTicket wrong input data')
    }
    
    return this.http.post<GetOldestTicketResponse[]>(`${this.baseUrl}/tickets/oldest`, data)
  }

  getDictionaries(): Observable<Dict> { // todo add user?
    return this.http.post<Dict>(`${this.baseUrl}/dictionaries/all`, null);
  }
}