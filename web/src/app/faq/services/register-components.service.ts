import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class RegisterComponentsService {
    private _isComponentsRegistered$ = new BehaviorSubject<boolean>(false)

    public listenComponentsRegistered$ (): Observable<boolean> {
        return this._isComponentsRegistered$.asObservable()
    }

    public isComponentsRegistered (): boolean {
        return this._isComponentsRegistered$.getValue()
    }

    public async setComponentsRegistered (data: boolean): Promise<void> {
        this._isComponentsRegistered$.next(data)
        return Promise.resolve()
    }


}