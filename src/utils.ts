import * as express from 'express'
import * as mongoose from 'mongoose' 
export interface DebugSettings {
    debug: boolean
}

function sendData(res:express.Response, err:any, data:any) {
    if (!err && !res) return this;
    if (err) {
        if (err.name == 'MongooseError') {
            res.send(500);
        } else {
            res.header('Title', 'Invalid Data');
            console.log(err);
            if (err instanceof mongoose.Error) {
                res.header('Message', err.toString());
            } else {
                res.header('Message', err.message);
            }
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
export function send(req: express.Request, res: express.Response, dataFunction: any) {
    let isPromise = dataFunction && typeof dataFunction.then == 'function'
    if (dataFunction) {
        if (typeof (dataFunction) == 'function') {
            try {
                dataFunction((err, data) => sendData(res, err, data));
            } catch (ex) {
                sendData(res, ex, null)
            }
        } else if (isPromise) {
            try {
                dataFunction.then(result => {
                    sendData(res, null, result);
                }).catch(reason => {
                    sendData(res, reason, null)
                })
            } catch (ex) {
                sendData(res, ex, null)
            }
        } else {
            sendData(res, null, dataFunction);
        }
    } else {
        throw new Error('No Data passed');
    }
}