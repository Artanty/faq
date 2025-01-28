import { Inject, Injectable } from "@angular/core";

@Injectable()
export class CoreService {
    
    private _routerPath = '/'

    public setRouterPath (data: string) {
        console.log('Router path changed: ' + data)
        this._routerPath = data
    }

    public getRouterPath() {
        return this._routerPath;
    }

    public isDev (): boolean {
        return this.getBaseUrl().includes('http://localhost')
    }

    public isInsideHost (): boolean {
        return this._routerPath !== '/'
    }

    public getBaseUrl (): string {
        return __webpack_public_path__;
    }
}