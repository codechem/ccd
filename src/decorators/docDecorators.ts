import { CCController } from '../ccController';
import { CCActionDescritor} from './ccActionDescriptor';
import { ProxyHandlerDescritor, VERBS_GROUP_NAME } from './verbDecorators';
import { ensureDescriptorStore } from '../utils';
import { IDescriptorEnabled, InvokeOrder } from './descriptorStore';
export const GROUP_NAME = 'docDescriptors'

class DocumentationDescriptor implements CCActionDescritor {
    constructor(public targetName: string, public outputDir: string) { }
    apply(ctrl: CCController & IDescriptorEnabled) {
        let group = ctrl.__descriptors.get(VERBS_GROUP_NAME);
        console.log(group.descriptors.map((r: ProxyHandlerDescritor) => `${r.verb}:${r.targetName}`))
        console.log(`Output to ${this.outputDir}`);
    }
}

export function docGen(outputDir: string) {
    return function (constructor) {
        ensureDescriptorStore(constructor)
        let ctrl = constructor.prototype as CCController & IDescriptorEnabled;
        let docDescriptor = new DocumentationDescriptor(constructor.name, outputDir)
        ctrl.__descriptors.addTo(GROUP_NAME, InvokeOrder.LAST, docDescriptor);
        return constructor;
    }
}