import { Model, Document, FilterQuery, UpdateQuery, ClientSession } from 'mongoose';
import { IBaseRepository } from '../interfaces/Ibase-repositry';
export declare abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
    protected model: Model<T>;
    constructor(model: Model<T>);
    create: (data: Partial<T>, session?: ClientSession) => Promise<T>;
    findById: (id?: string) => Promise<T | null>;
    findOne: (query: FilterQuery<T>) => Promise<T | null>;
    findAll: () => Promise<T[]>;
    update: (id: string, data: Partial<T>, session?: ClientSession) => Promise<T | null>;
    delete: (id: string, session?: ClientSession) => Promise<boolean>;
    findByIdAndUpdate: (id: string, update: UpdateQuery<T>, options?: {
        new?: boolean;
    }, session?: ClientSession) => Promise<T | null>;
    findByIdAndDelete: (id: string, session?: ClientSession) => Promise<T | null>;
}
//# sourceMappingURL=base-repositry.d.ts.map