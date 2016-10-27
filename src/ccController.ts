import { send, DebugSettings } from './utils'
import * as mongoose from 'mongoose';
import { IRouter, RequestHandler } from 'express';
import { CCService } from './ccService';
import { ProxyHandlerDescritor } from './controllerDecorators'
import * as express from 'express'

export interface ICCController {
    router: IRouter;
    debugSettings?: DebugSettings;
    setRoutes(): void;
    setDefaultRoutes(...middlewares: RequestHandler[]): IRouter;
    send(req: any, res: any, data: (err: any, data: any) => any | Object | any): void;
    error(req: any, res: any, data: Object): void;
    proxied(method: any): (req: express.Request, res: express.Response, next: express.NextFunction) => void;
    ctrl(name: string): RequestHandler;
}

export class CCController implements ICCController {
    constructor(public router: IRouter = null, public debugSettings?: DebugSettings) {
        if(!this.router)
            this.router = express.Router()
        if (!debugSettings)
            debugSettings = { debug: false } 
        this.setRoutes()
        this._setProxiedMethods()
    }

    public setRoutes() { }

    public setDefaultRoutes(...middlewares: RequestHandler[]): IRouter {
        return this.router;
    }
    send(req, res, data: (err: any, data: any) => any | Object | any) {
        send(req, res, data);
    }
    error(req, res, data: Object) {
        console.log('error happened, please fix me ');
        res.sendStatus(401);
    }
    proxied(method) {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                let result = method.apply(this, [req, res, next])
                this.send(req, res, result);
            } catch (ex) {
                console.log(`Just Crashed with Error:${ex.message}`);
                if (ex.stack)
                    console.log(ex.stack)
                res.sendStatus(500);
            }
        }
    }

    private _setProxiedMethods() {
        if (this['proxyHandlerDescriptors']) {
            let proxyHandlerDescriptors = this['proxyHandlerDescriptors'] as ProxyHandlerDescritor[]

            proxyHandlerDescriptors.forEach(p => {
                this[p.methodName] = this.proxied(this[p.methodName]);
                this.router[p.verb].apply(this.router, [p.resource, ...p.handlers, this[p.methodName].bind(this)])
            })
            this['proxyHandlerDescriptors'] = proxyHandlerDescriptors.slice(0, (<any>this).proxyHandlerDescriptors.length)
        }
    }

    public ctrl(name: string): RequestHandler {
        return this.proxied(this[name]);
    }
}
