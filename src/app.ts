import * as http from 'http'
import { NextFunction } from './utils';
import { ICCController } from './ccController'

export type Middleware = NextFunction | ICCController

export class App{
    middlewares:Middleware[]
    
    constructor(){

    }
    use(...middlewares:Middleware[]):App{
        return this
    }

    listen(port):Promise<void>{
        const server = http.createServer(this.rootController);

        throw 'Not implemented';
    }

    private rootController(req, res){
        
    }
}