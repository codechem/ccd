<img height="100" src="https://raw.githubusercontent.com/codechem/ccd-snippets/master/images/ccdLogo.png"></img>

# CCD - ES7 web framework for node 

[![Join the chat at https://gitter.im/codechem/ccd](https://badges.gitter.im/codechem/ccd.svg)](https://gitter.im/codechem/ccd?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Travis](https://img.shields.io/travis/codechem/ccd.svg)]()
[![npm](https://img.shields.io/npm/v/ccd.svg)]()
[![npm](https://img.shields.io/npm/dm/ccd.svg)](https://github.com/codechem/ccd)
[![Maintenance](https://img.shields.io/maintenance/yes/2016.svg)]()

Expressive, class based approach web framework. 
It uses the latest ES7 features like async/await and decorators to make writing web apps and apis simple and fun.
It can be used thru typescript only at the moment  

## Installation

```
$ npm install ccd
```

## Example:

```js
//you can bundle the controllers logic in a single or multiple classes
class HelloCtrl extends CCController{
    //use decorators on the controllers to 
    @get('/hello')    //or get('/hello', ...any middleware methods)
    helloWorld(req, res){
        //return anything, object|(err,data)=void, promise .. it works with all of them
        return 'helloWorld' 
    }
    
    @get('/db')
    getFromDb(req, res){ //simple as that, no callbacks no waiting
        return this.svc.getById(req.params.id)
    }

    @get('/db-more')
    async getFromDb(req, res){ //simple as that, no callbacks no waiting
        let result =  await this.svc.getById(req.params.id)
        //... more work
        return result;
    }
    
    @put('/crash')
    crash(req, res){
        //server will keep working and will return 500 
        throw 'whatever' 
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
//Attach the controller to express
const ctrl = new HelloCtrl()
app.use('/', ctrl.router)
app.use('/hello', ctrl.router)
app.listen(3000);
```

## Dependencies

```
    typescript
    debug
    express>
    mongoose
```
## Plugins
    
### 1. [ccd-mongo](https://github.com/codechem/ccd-mongo)

- Integration with mongod for rapid development of db driven services
- ```npm install ccd-mongo```
- Example:
```typescript
class UserCtrl extends CCServiceController<User>{
    @post('/login')    
    login(req, res){
        //yes, that simple, 
        //model is regulat mongoose model
        return this.model.findOne(req.body); 
    }
}

//Or If you preffer to separate services and controllers then:
class SpiecesSvc extends CCService<Spiece>{
    ofKind(kind:string){
        return this.model.find({Kind:kind}).exec();
    }
}
//----------
class SpiecesCtrl extends CCController{
    spieces: new SpiecesSvc('Spieces')
    @get('/spieces/:kind') 
    ofKind(req, res){
            return spieces.ofKind(req.params.kind);
    }
}
```

### 1. [ccd-ng2](https://github.com/codechem/ccd-ng2)

- Provides ```@ngGenSvc``` decorator that generates angular2 services for a given ```CCController```

#### Server:
```typescript
@ngSvcGen('./client/svc', true)
class HelloCtrl extends CCController{
    @get('/hello/:name')    
    helloWorld(req, res){
        return `hello ${req.params.name}`
    }

    @post('/:id')    
    doSomething(req, res){
        return ....
    }
    ...
}
```

#### Output(Angular 2 service):

```typescript
import { Injectable } from '@angular/core';
import { SimpleRestService } from 'ccNgRest';

@Injectable()
export class HelloCtrlSvc{
    constructor(private rest: SimpleRestService){}

    helloWorld(name){
        return this.rest.get('/hello/'+name);
    }

    doSomething(id, payload){
        return this.rest.post('/'+id, payload);
    }
}
```

### 1. [ccd-doc](https://github.com/codechem/ccd-doc)

- Not published yet


## Contributors
[Costa Halicea](https://github.com/halicea)|
