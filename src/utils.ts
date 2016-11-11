import * as express from 'express'
import { DescriptorStore } from './decorators/descriptorStore';

export interface DebugSettings {
    debug: boolean
}
export type SenderFunction = (res:express.Response, err:any, data:any)=>void

export function sendData(res:express.Response, err:any, data:any) {
    if (!err && !res) return this;
    if (err) {
        if (err.name === 'MongooseError') {
            res.send(500);
        } else {
            res.header('Title', 'Invalid Data');
            console.log(err);
            res.header('Message', err.message);
            res.sendStatus(400);
        }
    } else {
        try {
            res.json(data);    
        } catch (error) {
            sendData(res, error, null)
        }   
    }
}
export function ensureDescriptorStore(item:any){
    if(!item['__descriptors'])
        item['__descriptors'] = new DescriptorStore()
    return item
}

export function send(req: express.Request, res: express.Response, dataObject: any, sendFunction:SenderFunction=sendData) {
    let isPromise = dataObject && typeof dataObject.then === 'function'
    if (dataObject) {
        if (typeof (dataObject) === 'function') {
            try {
                dataObject((err, data) => sendFunction(res, err, data));
            } catch (ex) {
                sendFunction(res, ex, null)
            }
        } else if (isPromise) {
            try {
                dataObject.then(result => {
                    sendFunction(res, null, result);
                }).catch(reason => {
                    sendFunction(res, reason, null)
                })
            } catch (ex) {
                sendFunction(res, ex, null)
            }
        } else {
            sendFunction(res, null, dataObject);
        }
    } else {
        throw new Error('No Data passed');
    }
}