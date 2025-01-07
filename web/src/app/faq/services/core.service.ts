import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class CoreService {
    private _routerPath = '/'

    public setRouterPath (data: string) {
        console.warn('Router path changed: ' + data)
        this._routerPath = data
    }

    public getRouterPath() {
        return this._routerPath;
    }
}