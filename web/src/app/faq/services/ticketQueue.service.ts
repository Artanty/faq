import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Ticket } from "../models/ticket.model";
import { removeDuplicatesById } from "./helpers";
export interface QueueState {
    all: number
}

@Injectable()
export class TicketQueueService {
    private _ticketStack: Ticket[] = []
    private _currentTicket = new BehaviorSubject<Ticket | null>(null)
    private _queueState = new BehaviorSubject<QueueState>({ all: 0 })

    public listenQueueState (): Observable<QueueState> {
        return this._queueState.asObservable()
    }

    public getQueueState (): QueueState {
        return this._queueState.getValue()
    }

    public pushToQueue (tickets: Ticket[]) {
        if (!tickets.length) { throw new Error('no tickets recieved')}
        this._ticketStack = removeDuplicatesById([...this._ticketStack, ...tickets])
        
        this.setQueueState({
            all: this._ticketStack.length
        })
        this.nextTicket()
    }

    // public setQueue (tickets: Ticket[]) {
    //     if (!tickets.length) { throw new Error('no items in arr of tickets')}
    //     this._ticketStack = tickets
    //     this.setQueueState({
    //         all: this._ticketStack.length
    //     })
    //     this.nextTicket()
    // }

    public nextTicket (): void {
        if (!this._ticketStack.length) { throw new Error('no items in arr of tickets')}
        const nextTicket = this._ticketStack[0]
        this._currentTicket.next(nextTicket)
    }

    public removeTicketFromQueue(ticketId: number) {
        this._ticketStack = this._ticketStack.filter(t => t.id !== ticketId)
        this.setQueueState({
            all: this._ticketStack.length
        })
    }

    public skipTicket (): void {
        if (!this._ticketStack.length) { throw new Error('no items in arr of tickets')}

        if (this._ticketStack.length <= 1) {
            return; // No need to move if the array has 0 or 1 element
        }
    
        const first = this._ticketStack.shift()!; // Remove the first element
        this._ticketStack.push(first); // Add it to the end
        this.nextTicket()
    }


    // public getQueue (): Ticket[] {
    //     return this._ticketQueue.getValue()
    // }

    public listenQueue (): Observable<Ticket> {
        // if (this._currentTicket.getValue() === null) throw new Error('no ticket items in queue')
        return this._currentTicket.asObservable() as Observable<Ticket>
    }

    // public moveToQueueEnd (ticket: Ticket) {
    //     const currentQueue = this._ticketQueue.getValue();
    //     const ticketIndex = currentQueue.findIndex(t => t.id === ticket.id);

    //     if (ticketIndex === -1) {
    //         console.warn('Ticket not found in the queue:', ticket);
    //         return;
    //     }

    //     if (ticketIndex === currentQueue.length - 1) {
    //         console.log('Ticket is already last:', ticket);
    //         return;
    //       }

    //     const updatedQueue = [
    //     ...currentQueue.slice(0, ticketIndex),
    //     ...currentQueue.slice(ticketIndex + 1),
    //     currentQueue[ticketIndex],
    //     ];

    //     this._ticketQueue.next(updatedQueue);
    // }

    private setQueueState (data: QueueState): void {
        this._queueState.next(data)
    }

    
    
    
}