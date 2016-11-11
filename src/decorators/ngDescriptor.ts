import { VERBS_GROUP_NAME, ProxyHandlerDescritor } from './verbDecorators';
import { CCActionDescritor} from './ccActionDescriptor';
import { CCController } from '../ccController';
import { ensureDescriptorStore } from '../utils';;
import {DescriptorGroup,InvokeOrder} from './descriptorStore';
import * as path from 'path'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp';

export const NG_SVC_GROUP_NAME = 'ngServices';
class NgServiceCreatorDescriptor implements CCActionDescritor{
    constructor(public targetName:string, public outputDir:string, public name?:string, public excludeSuffix='Ctrl', public skipMethods=[]){}
    
    apply(ctrl:CCController){
        console.log(`Creating NG service for ${this.targetName}`)
        console.log('Methods:')
        let group = ctrl.__descriptors.get(VERBS_GROUP_NAME)
        let filename = this.name;
        if(!filename){
            filename = this.targetName
        }
        mkdirp.sync(this.outputDir);
        const filepath = path.join(this.outputDir, filename+'.ts')
        const fileContents = this.getTemplate(this.targetName, group);
        fs.writeFileSync(filepath, fileContents);
    }
    getTemplate(name:string, group:DescriptorGroup){
        return (

`import { Injectable } from '@angular/core';
import { SimpleRestService } from 'ccNgRest';
import { DescriptorGroup } from './descriptorStore';;

@Injectable()
export class ${name}Svc{
    constructor(private rest: SimpleRestService){

    }
${group.descriptors.map(this.createServiceMethod.bind(this)).join('\n')}
}`)
    }
    createServiceMethod(desc:ProxyHandlerDescritor){
        let hasPayload=desc.verb === 'post' || desc.verb === 'put'
        let resource = desc.resource
        let methodArgs = ''
        let args = `'${resource}'`
        if(resource.indexOf(':id')>0){
            methodArgs+='id'
            args=args.replace(':id', '')+'+id'
        }
        if(hasPayload){
            methodArgs += ', payload'
            args += ', payload'
        }
        return (`
    ${desc.targetName}(${methodArgs}){
        return this.rest.${desc.verb}(${args});
    }`)
    }
}

export function ngSvcGen(outputDir: string, apply:boolean=true,  name=null,excludeSuffix='Ctrl',skipMethods=[]) {
    return function (constructor: any) {
        if(!apply)
            return constructor;
        ensureDescriptorStore(constructor);;
        let ctrl = constructor.prototype as CCController;
        let docDescriptor = new NgServiceCreatorDescriptor(constructor.name, outputDir)
        ctrl.__descriptors.addTo(NG_SVC_GROUP_NAME, InvokeOrder.LAST, docDescriptor);
        return constructor;
    }
}