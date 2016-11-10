import { Injectable } from '@angular/core';
import { SimpleRestService } from 'ccNgRest';

@Injectable()
export class HelloCtrlSvc{
    constructor(private rest: SimpleRestService){

    }

    helloWorld(){
        return this.rest.get('/hello');
    }

    update(id, payload){
        return this.rest.post('/'+id, payload);
    }

    helloWorldAsync(){
        return this.rest.get('/async');
    }

    errorWorldAsync(){
        return this.rest.get('/async-error');
    }
}