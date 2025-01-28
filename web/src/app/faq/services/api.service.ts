import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';
import { Answer } from '../models/answer.model';
import { CreateScheduleRequest, CreateTicketRequest, DeleteScheduleRequest, DeleteWithAnswersRequest, GetAnswersByTicketIdRequest, GetOldestTicketRequest, GetSchedulesByUserIdRequest, GetSchedulesByUserIdResponseItem, GetTicketByIdRequest, GetUserTicketsRequest } from './api.service.types';
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

  getAnswersByTicketId(data: GetAnswersByTicketIdRequest): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.baseUrl}/answers/ticket/${data.ticketId}`);
  }

  submitAnswer(answer: { ticketId: number; body: string; userId: number; rate: number }): Observable<Answer> {
    return this.http.post<Answer>(`${this.baseUrl}/answers/save`, answer);
  }

  getOldestTicket (data: GetOldestTicketRequest): Observable<Ticket[]> {
    // if (!(data !== null && typeof data === 'object' && Object.keys(data).length && Object.values(data).every(Number))) {
    //   throw new Error('apiService.getOldestTicket wrong input data')
    // }
    
    return this.http.post<Ticket[]>(`${this.baseUrl}/tickets/oldest`, data)
  }

  getDictionaries(): Observable<Dict> { // todo add user?
    return this.http.post<Dict>(`${this.baseUrl}/dictionaries/all`, null);
  }

  deleteWithAnswers (data: DeleteWithAnswersRequest): Observable<any> {
    return this.http.post<any>( `${this.baseUrl}/tickets/deleteWithAnswers`, data)
  }

  getSchedulesByUserId (data: GetSchedulesByUserIdRequest): Observable<GetSchedulesByUserIdResponseItem[]> {
    return this.http.post<GetSchedulesByUserIdResponseItem[]>(`${this.baseUrl}/schedule/findByUserId`, data)
  }

  createSchedule (data: CreateScheduleRequest): Observable<number> {
    return this.http.post<any>(`${this.baseUrl}/schedule/create`, data)
  }

  deleteSchedule (data: DeleteScheduleRequest): Observable<unknown> {
    return this.http.post<any>(`${this.baseUrl}/schedule/delete`, data)
  }
  
}