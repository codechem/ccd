import { ProxyHandlerDescritor } from './controllerDecorators';
import { IRouter, Request, RequestHandler, Response, Router } from './refs';
import { DebugSettings, send, sendData, SenderFunction } from './utils';

export interface NextFunction {
    (err?: any): void;
}

export interface ICCController {
    router: IRouter;
    debugSettings?: DebugSettings;
    setRoutes(): void;
    setDefaultRoutes(...middlewares: RequestHandler[]): IRouter;
    send(req: any, res: any, data: (err: any, data: any) => any | Object | any): void;
    error(req: any, res: any, data: Object): void;
    proxied(method: any): (req: Request, res: Response, next: NextFunction) => void;
    ctrl(name: string): RequestHandler;
}

export class CCController implements ICCController {
    constructor(public router: IRouter = null, public debugSettings?: DebugSettings) {
        if(!this.router)
            this.router = Router()
        if (!debugSettings)
            debugSettings = { debug: false } 
        this.setRoutes()
        this._setProxiedMethods()
    }

    public setRoutes() { }

    public setDefaultRoutes(...middlewares: RequestHandler[]): IRouter {
        return this.router;
    }

    senderFunction(res, err, data){
        return sendData(res, err, data);
    }

    /**
     * Instead of returning the result you can use this method to pass the return result   
     * @result {hashmap|}
     */
    send(req, res, data:(err:any, data:any)=>any, senderFunction?:SenderFunction):void {
        let sf = senderFunction;
        if(!sf){
            sf = this.senderFunction.bind(this);
        }
        send(req, res, data, sf);
    }

    /**
     * Do not use this method yet, it's still in development
     */
    error(req, res, data: Object) {
        //TODO: implement me properly
        console.log('error happened, please fix me ');
        res.sendStatus(401);
    }

    proxied(method) {
        return (req: Request, res: Response, next: NextFunction) => {
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
