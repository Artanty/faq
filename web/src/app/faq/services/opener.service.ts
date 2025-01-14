import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { GetOldestTicketRequest, GetSchedulesByUserIdRequest, GetSchedulesByUserIdResponse } from "./api.service.types";
import { filter, from, map, mergeMap, Observable, switchMap } from "rxjs";
import { Ticket } from "../models/ticket.model";
import { TicketQueueService } from "./ticketQueue.service";
import { Router } from "@angular/router";
import { buildUrl } from "./route-builder";
import { UserService } from "./user.service";
import { CoreService } from "./core.service";

@Injectable()
export class OpenerService {
    constructor (
        private _apiService: ApiService,
        private _ticketQueueService: TicketQueueService,
        private router: Router,
        private _userService: UserService,
        private _coreService: CoreService,
    ) {}

    /**
     * Хост отправляет ивент 'SHOW_OLDEST_TICKET'
     * Запрашиваем все расписаня
     */
    public maybeOpenModal() {
        const req: GetSchedulesByUserIdRequest = {
            userId: this._userService.getUser()
        }
        this._apiService.getSchedulesByUserId(req)
        .pipe(
            switchMap((res: GetSchedulesByUserIdResponse): Observable<Ticket[]> => {
                const filtered = this._filterSchedules(res, new Date())
                return this._makeRequests(filtered)
            }),
            filter((res: any) => res.length)    
        ).subscribe((res) => {
            this._ticketQueueService.pushToQueue(res)
            this.router.navigateByUrl(buildUrl('ticket', this._coreService.getRouterPath()))
        })    
    }

    /**
     * Отбираем все расписания, что в принципе могут быть сейчас сработать.
     */
    private _filterSchedules (schedules: GetSchedulesByUserIdResponse, currentTime: Date) {
        // schedules = schedules.map(el => {
        //     el.frequency = currentTime.getMinutes()
        //     return el
        // })
        return schedules.filter(schedule => {
            return schedule.active && 
            this._isDayActive(schedule.weekdays, currentTime) === true &&
            this._isFrequencyStep(schedule.frequency, currentTime) === true
        })
    }

    // Check if the current day is active in the weekdays pattern
    private _isDayActive (scheduleWeekdays: string, currentTime: Date) {
        const currentDay = currentTime.getDay(); // 0 (Sunday) to 6 (Saturday)
        const dayIndex = currentDay === 0 ? 6 : currentDay - 1
        return scheduleWeekdays.charAt(dayIndex) === '1';
    }

    private _isFrequencyStep(frequency: number, currentTime: Date): boolean {
        // Cap frequency at 4 months (approximately 4 * 30 * 24 * 60 = 172,800 minutes)
        const maxFrequency = 172800; // 4 months in minutes
        if (frequency > maxFrequency) {
            throw new Error("Frequency cannot exceed 4 months.");
        }
        if (currentTime.getMinutes() === 0) {
            return frequency === 60;
        }   
        return currentTime.getMinutes() % frequency === 0;
    }

    /**
     * Нужно отфильтровать билеты, которые были отвечены за период (шаг частоты, frequency)
     * то есть не показываем если:
     * now - lastShownDate < frequency
     * то есть показываем если:
     * now - lastShownDate > frequency
     */
    private _filterAnswered (res: Ticket[], scheduleFrequency: number) {
        return res.filter((el: any) => {
            const now = new Date()
            const ticketLastDate = new Date(el.lastShownDate)
            const diffInMs = (now.getTime() - ticketLastDate.getTime())
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            const isAnswered = diffInMinutes < scheduleFrequency
            
            return !isAnswered
        })
    }

    /**
     * решить какую функцию и с какими параметрами вызывать:
     * - если указан конкретный билет
     * - если указана папка и тд
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
                    return this._apiService.getOldestTicket(req).pipe(
                        map((res) => {
                            return this._filterAnswered(res, schedule.frequency)
                        })
                    )
                }
            }),
            map(res => {
                return Array.isArray(res) 
                ? res
                : [res]
            })
        )    
    }
}