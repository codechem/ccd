import mongoose = require('mongoose')
import {CCController, ICCController} from './ccController'
import {CCService} from './ccService'
import {DebugSettings} from './utils' 
import { IRouter, RequestHandler } from 'express'

export interface ICCServiceController<T extends mongoose.Document> extends ICCController {
    svc: CCService<T>;
    router: IRouter;
    debugSettings?: DebugSettings;
    paramsKey: string;
    setDefaultRoutes(...middlewares: RequestHandler[]): IRouter;
    index(req: any, res: any): PromiseLike<T[]>;
    view(req: any, res: any): PromiseLike<T>;
    remove(req: any, res: any): PromiseLike<T>;
    insert(req: any, res: any): PromiseLike<T>;
    update(req: any, res: any): PromiseLike<T>;
}

export class CCServiceController<T extends mongoose.Document> extends CCController implements ICCServiceController<T>{
    paramsKey: string = 'id';
    constructor(public svc: CCService<T>, public router: IRouter = null, public debugSettings?: DebugSettings) {
        super(router, debugSettings)
    }
    public setDefaultRoutes(...middlewares: RequestHandler[]): IRouter {
        var r = this.router;
        let pr = this.proxied.bind(this);
        r.get('/', ...middlewares, pr(this.index))
        r.get('/:id', ...middlewares, pr(this.view))
        r.put('/', ...middlewares, pr(this.insert))
        r.delete('/', ...middlewares, pr(this.remove))
        r.post('/:id', ...middlewares, pr(this.update))
        return r;
    }
    public index(req, res): PromiseLike<T[]> {
        return this.svc.getAll();
    }

    public view(req, res): PromiseLike<T> {
        return this.svc.byId(req.params[this.paramsKey]);
    }

    public remove(req, res): PromiseLike<T> {
        return this.svc.deleteById(req.params[this.paramsKey]);
    }

    public insert(req, res): PromiseLike<T> {
        return this.svc.createAndSave([req.body]);
    }

    public update(req, res) {
        return this.svc.updateById(req.params[this.paramsKey], req.body);
    }
}