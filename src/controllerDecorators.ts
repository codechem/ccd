import * as console from 'console';
import { RequestHandler } from './refs'
import { CCController } from './ccController'
export interface CCActionDescritor {
    apply(target: any)
    targetName:string
}

export class ProxyHandlerDescritor implements CCActionDescritor {
    verb: string
    resource: string
    public targetName: string
    handlers: RequestHandler[]
    constructor(targetName:string){
        this.targetName = targetName;
    }
    apply(target: any) {
        let ctrl = <CCController>target;
        let proxiedMethod = ctrl[this.targetName] = ProxyHandlerDescritor.proxied(ctrl, this.targetName);
        ctrl.router[this.verb].apply(ctrl.router,
            [this.resource, ...this.handlers, proxiedMethod.bind(ctrl)])
    }
    private static proxied(ctrl:CCController, targetName:string){
        let method = ctrl[targetName];
        return (req, res, next) => {
            try {
                let result = method.apply(ctrl, [req, res, next])
                ctrl.send(req, res, result);
            } catch (ex) {
                console.log(`Just Crashed with Error:${ex.message}`);
                if (ex.stack)
                    console.log(ex.stack)
                res.sendStatus(500);
            }
        }
    }
}

function proxied(verb, resource, ...handlers) {
    return function (target: CCController, propertyKey: string, descriptor: PropertyDescriptor) {
        let group = ensureDescriptors(target, 'proxyHandlerDescriptors')
        let handlerDesc = new ProxyHandlerDescritor(propertyKey);
        handlerDesc.verb = verb;
        handlerDesc.resource = resource;
        handlerDesc.handlers = handlers;
        group.push(handlerDesc);
        return descriptor;
    }
}

export function get(resouce, ...handlers) { return proxied('get', resouce, ...handlers) }
export function post(resouce, ...handlers) { return proxied('post', resouce, ...handlers) }
export function put(resouce, ...handlers) { return proxied('put', resouce, ...handlers) }
export function del(resouce, ...handlers) { return proxied('delete', resouce, ...handlers) }
export function opt(resouce, ...handlers) { return proxied('options', resouce, ...handlers) }
export function head(resouce, ...handlers) { return proxied('head', resouce, ...handlers) }


class DocumentationDescriptor implements CCActionDescritor{
    constructor(public targetName:string){}
    apply(ctrl:CCController){
        let routes = ctrl.__descriptors['proxyHandlerDescriptors'] as ProxyHandlerDescritor[];
        console.log(routes.map(r=>`${r.verb}:${r.targetName}`))
    }
}

export function ngCtrlGen(outputDir: string) {
    console.log(`registered ngCtrlGen to ${outputDir}`)
    return function (constructor: Function) {
        console.log(`generating NgServices for ${constructor.name}`);
    }
}

export function docGen(outputDir: string) {
    console.log(`registered docGen to ${outputDir}`)
    return function (constructor: Function) {
        let group = ensureDescriptors(constructor.prototype, 'docDescriptors')
        group.push(new DocumentationDescriptor(constructor.name));
    }
}

function ensureDescriptors(ctrl:CCController, group:string='default'){
    if(!ctrl['__descriptors']){
        ctrl['__descriptors'] = {}
    }
    if(!ctrl.__descriptors[group]){
        ctrl.__descriptors[group] = [];
    }
    return ctrl.__descriptors[group];
}