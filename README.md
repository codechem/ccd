
Expressive, class based approach web framework. 
It uses the latest javascript features like async/await and decorators to make writing web apps and apis simple and fun. 

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

## Contributors
[Costa Halicea](https://github.com/halicea)|
[Lazar Nikolov](https://codechem.com)|
[Stefan Popovski](https://codechem.com)
