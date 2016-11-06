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
    /**+
     * Retrieves all documents from the collection
     */
    getAll(callback?: Clb<T[]>): Promise<T[]> {
        return this.model.find().exec(callback);
    }
    /**
     * Retrieves a document by it's Id
     */
    byId(id: Id, callback?: Clb<T>): Promise<T> {
        return this.model.findById(id).exec(callback);
    }
    /**
     * Updates the document by the given id and returns it
     * @param {string | number | ObjectId} id the Id of the document in the db
     * @param  {any} update a hashmap of the fields to update and their new values as keys
     * @param {Clb<T>}  callback optional callback that can be used to retrieve the results
     * @returns {Promise<T>} 
     */
    updateById(id: Id, update: any, callback?: Clb<T>): Promise<T> {
        return this.model.findByIdAndUpdate(id, update, { new: true }).exec(callback);
    }

    /**
     * Deletes a document by the given id and returns it
     */
    deleteById(id: Id, callback?: Clb<T>): Promise<T> {
        return this.model.findByIdAndRemove(id).exec(callback);
    }

    /**
     * For a given object it tries to create T instance, saves it to the database and returns it
     * @argument document:any
     * @returns T
     */
    createAndSave(document: any, callback?: Clb<T>): Promise<T> {
        return this.insert(this.create(document), callback);
    }

    /**
     * From a given array of objects it tries to create T[] array and saves it to the database
     */
    createAndSaveMany(documents: any[], callback?: Clb<T[]>): Promise<T[]> {
        return this.model.create(documents, callback);
    }
    /**
     * Creates a new object of type T and returns it. 
     * @param {any} document a hasmap with the fields we want to create the object from
     * @param  {Clb<T>} an optional callback function that can be used to get the newly created object 
     */
    create(document: any = {}, callback?: Clb<T>): T {
        let newDoc = new this.model(document) as any as T;
        if (callback)
            callback(null, newDoc);
        return newDoc;
    }
    insert(document: T, callback?: Clb<T>): Promise<T> {
        return document.save(callback);
    }
}

