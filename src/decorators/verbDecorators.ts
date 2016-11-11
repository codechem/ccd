import { RequestHandler } from '../refs'
import { CCController } from '../ccController'
import { CCActionDescritor } from './ccActionDescriptor';
import { ensureDescriptorStore } from '../utils';
import { IDescriptorEnabled, InvokeOrder } from './descriptorStore';

export const VERBS_GROUP_NAME = 'proxyHandlerDescriptors';
export function get(resouce, ...handlers) { return proxied('get', resouce, ...handlers) }
export function post(resouce, ...handlers) { return proxied('post', resouce, ...handlers) }
export function put(resouce, ...handlers) { return proxied('put', resouce, ...handlers) }
export function del(resouce, ...handlers) { return proxied('delete', resouce, ...handlers) }
export function opt(resouce, ...handlers) { return proxied('options', resouce, ...handlers) }
export function head(resouce, ...handlers) { return proxied('head', resouce, ...handlers) }

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
    return function (target: IDescriptorEnabled, propertyKey: string, descriptor: PropertyDescriptor) {
        ensureDescriptorStore(target);
        let handlerDesc = new ProxyHandlerDescritor(propertyKey);
        handlerDesc.verb = verb;
        handlerDesc.resource = resource;
        handlerDesc.handlers = handlers;
        target.__descriptors.addTo(VERBS_GROUP_NAME, InvokeOrder.FIRST, handlerDesc);
        return descriptor;
    }
}

