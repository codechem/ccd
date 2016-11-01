import {RequestHandler} from './refs'

export interface ProxyHandlerDescritor {
    verb: string
    resource: string,
    methodName: string
    handlers: RequestHandler[]
}

function proxied(verb, resource, ...handlers) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!target.proxyHandlerDescriptors) {
            target.proxyHandlerDescriptors = []
        }
        let handlerDesc: ProxyHandlerDescritor = {
            verb,
            resource,
            methodName: propertyKey,
            handlers
        }
        target.proxyHandlerDescriptors.push(handlerDesc)
        return descriptor;
    }
}

export function get(resouce, ...handlers) { return proxied('get', resouce, ...handlers) }
export function post(resouce, ...handlers) { return proxied('post', resouce, ...handlers) }
export function put(resouce, ...handlers) { return proxied('put', resouce, ...handlers) }
export function del(resouce, ...handlers) { return proxied('delete', resouce, ...handlers) }
export function opt(resouce, ...handlers) { return proxied('options', resouce, ...handlers) }
export function head(resouce, ...handlers) { return proxied('head', resouce, ...handlers) }
