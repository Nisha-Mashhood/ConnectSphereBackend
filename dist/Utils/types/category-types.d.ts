import { Request } from 'express';
import { ICategory } from "../../Interfaces/Models/i-category";
export interface CategoryRequest extends Request {
    body: Partial<ICategory>;
    params: {
        id?: string;
    };
}
//# sourceMappingURL=category-types.d.ts.map