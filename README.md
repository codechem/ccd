# ccd  ES7 web framework for node 


[![npm version](https://badge.fury.io/js/ccd.png)](https://badge.fury.io/js/ccd)
[![Build Status](https://travis-ci.org/codechem/ccd.svg?branch=master)](https://travis-ci.org/codechem/ccd)

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
## Notes

**Mongoose** is temporary dependency because in the library there is a class called CCService 
which will be eventualy plugin for the **ccd** framework.

The idea behind this is easy and fast creation of services who use mongoose as a backend,
It contains all the CRUD methods already implmented and with combination with CCController implementation it provides really short and descriptive environment for devinging them, 
primarily because mongoose returns promises , so async/await are fully applicable. 

Example:

```javascript
    //Service implementation already has all the crud operations, and you can freely override them
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
 
## Contributors
[Costa Halicea](https://github.com/halicea)|
