import * as express from 'express'
import {CCController, get, docGen, ngCtrlGen} from  '../index'
let app = express()

@docGen('./docs')
@ngCtrlGen('./client/services')

class HelloCtrl extends CCController{
    @get('/hello')    
    helloWorld(req, res){
        return 'helloWorld'
    }

    @get('/async')    
    helloWorldAsync(req, res){
        return new Promise((resolve)=>{
            setTimeout(function() {
                resolve({value:'hello async'});
            }, 200);
        })
    }

    @get('/async-error')    
    async errorWorldAsync(req, res){
        return await new Promise((resolve, reject)=>{
            setTimeout(function() {
                reject('I just crashed in error world');
            }, 200);
        })
    }
}

const ctrl = new HelloCtrl()
app.use('/', ctrl.router)
app.use('/hello', ctrl.router)
app.listen(3000);