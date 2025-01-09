import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { GetOldestTicketRequest, GetSchedulesByUserIdRequest, GetSchedulesByUserIdResponse, GetSchedulesByUserIdResponseItem } from "./api.service.types";
import { from, map, mergeMap, Observable, switchMap, toArray } from "rxjs";
import { Ticket } from "../models/ticket.model";

@Injectable({
    providedIn: 'root'
})
export class OpenerService {
    constructor (
        private _apiService: ApiService
    ) {}
    // Check if the current day is active in the weekdays pattern
    private _isDayActive (scheduleWeekdays: string, currentTime: Date) {
        const currentDay = currentTime.getDay(); // 0 (Sunday) to 6 (Saturday)
        const dayIndex = currentDay === 0 ? 6 : currentDay - 1
        // Convert weekdays string to an array of booleans
        return scheduleWeekdays.charAt(dayIndex) === '1';
    }

    // Check if the current time matches the schedule frequency
    private _isFrequencyStep (frequency: number, currentTime: Date) {
        const currentMinutes = currentTime.getMinutes();
        return currentMinutes % frequency === 0
    }

    /**
     * Получаем все расписания. понимаем, нужно ли открывать модалку и какой билет в ней показывать.
     * Сначала отбираем все расписания, что в принципе могут быть сейчас сработать.
     */
    private _filterSchedules (schedules: GetSchedulesByUserIdResponse, currentTime: Date) {
        // todo delete
        schedules = schedules.map(el => {
            el.frequency = currentTime.getMinutes()
            return el
        })
        return schedules.filter(schedule => {
            return schedule.active && 
            this._isDayActive(schedule.weekdays, currentTime) === true &&
            this._isFrequencyStep(schedule.frequency, currentTime) === true
        })
    }

    /**
     * решить какую функцию и с какими параметрами вызывать
     */
    private _makeRequests (schedule: GetSchedulesByUserIdResponse): Observable<Ticket[]> {
        return from(schedule)
        .pipe(
            mergeMap(schedule => {
                if (schedule.ticketId) {
                    return this._apiService.getTicketById({ ticketId: schedule.ticketId })
                } else {
                    const req: GetOldestTicketRequest = { userId: schedule.userId, quantity: 10 }

                    if (schedule.topicId) {
                        req.topicId = schedule.topicId
                    }
                    if (schedule.folderId){
                        req.folderId = schedule.folderId
                    }
                    if (schedule.dateFrom && schedule.dateTo){
                        req.dateFrom = schedule.dateFrom
                        req.dateTo = schedule.dateTo
                    }
                    return this._apiService.getOldestTicket(req)
                }
            }),
            map(res => {
                return Array.isArray(res) 
                ? res
                : [res]
            })
        )    
    }

    public maybeOpenModal() {
        const req: GetSchedulesByUserIdRequest = {
            userId: 1
        }
        this._apiService.getSchedulesByUserId(req)
        .pipe(
            switchMap((res: GetSchedulesByUserIdResponse): Observable<Ticket[]> => {
                const filtered = this._filterSchedules(res, new Date())
                console.log(filtered)
                return this._makeRequests(filtered)
            })
        ).subscribe(res => {
            console.log(res)
        })
        
  }

//   {
//     
  
//       // Skip date filtering if ticketId is passed
//       if (schedule.ticketId === undefined) {
//         // Check if the current time is within the schedule's date range
//         const scheduleDateFrom = schedule.dateFrom ? new Date(schedule.dateFrom) : null;
//         const scheduleDateTo = schedule.dateTo ? new Date(schedule.dateTo) : null;
  
//         if (scheduleDateFrom && currentTime < scheduleDateFrom) continue; // Schedule hasn't started yet
//         if (scheduleDateTo && currentTime > scheduleDateTo) continue; // Schedule has ended
//       }
//   }
}