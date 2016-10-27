import * as mongoose from 'mongoose'
export type ObjectId = mongoose.Schema.Types.ObjectId;
export type Clb<T> = (error: any, result: T) => any
export type Id = ObjectId | string | number
export class CCService<T extends mongoose.Document>{
    modelName: string
    model: mongoose.Model<T>
    constructor(modelName) {
        this.modelName = modelName;
        if (!this.modelName)
            throw "modelName field must be set";
        this.model = mongoose.model<T>(this.modelName);
    }

    getAll(callback?: Clb<T[]>): Promise<T[]> {
        return this.model.find().exec(callback);
    }
    /**
     * Retrieves a document by it's Id
     */
    byId(id: string | number | ObjectId, callback?: Clb<T>): Promise<T> {
        return this.model.findById(id).exec(callback);
    }
    /**
     * Updates the document by the given id and returns it  
     */
    updateById(id: string | number | ObjectId, update: any, callback?: Clb<T>): Promise<T> {
        return this.model.findByIdAndUpdate(id, update).exec(callback);
    }
    deleteById(id: string | number | ObjectId, callback?: Clb<T>): Promise<T> {
        return this.model.findByIdAndRemove(id).exec(callback);
    }
    createAndSave(documents: Object[], callback?: Clb<T[]>) {
        return this.model.create(documents, callback);
    }
    create(document: Object = {}, callback?: Clb<T>): T {
        let newDoc = new this.model(document) as any as T;
        if (callback)
            callback(null, newDoc);
        return newDoc;
    }
    insert(document: T, callback?: Clb<T>): Promise<T> {
        return document.save(callback);
    }
}

