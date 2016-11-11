import { CCActionDescritor } from './ccActionDescriptor';

export interface IDescriptorEnabled{
    __descriptors:DescriptorStore;
}

export enum InvokeOrder {
    FIRST = 0,
    AFTER_FIRST = 1,
    BEFORE_LAST = 2,
    LAST = 3
}

export class DescriptorStore {
    private __indexes = { 0: {}, 1: {}, 2: {}, 3: {} }
    private __lists = { 0: [], 1: [], 2: [], 3: [] }

    apply(target) {
        for (let i = 0; i < 4; i++) {
            this.__lists[i].map(list => list.apply(target))
        }
    }

    addTo(groupName: string, order: InvokeOrder = InvokeOrder.FIRST, descriptor: CCActionDescritor) {
        let indexHash = this.__indexes[order];
        let groupList = this.__lists[order] as DescriptorGroup[];
        let index = 0;
        if (indexHash[groupName]===undefined) {
            index = groupList.length;
            groupList.push(new DescriptorGroup(groupName))
            indexHash[groupName] = index;
        }
        let group = groupList[index];
        group.descriptors.push(descriptor)
    }

    get(groupName: string):DescriptorGroup{
        for (let i = 0; i < 4; i++) {
            let index = this.__indexes[i][groupName]
            if (index !== undefined) {
                return this.__lists[i][index]
            }
        }
        return null
    }

    clear() {
        for (let i = 0; i < 4; i++) {
            this.__indexes[i] = {}
            this.__lists[i] = []
        }
    }
}

export class DescriptorGroup {
    constructor(public name: string, public descriptors: CCActionDescritor[] = []) { }
    apply(target: any) {
        this.descriptors.forEach(desc => desc.apply(target))
    }
}