import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatService {
    constructor(private http: HttpClient) {}

    sendStatData(payload: any): Observable<any> {
        return this.http.post<any>(`${process.env['STAT_BACK_URL']}/tickets`, payload);
      }
}