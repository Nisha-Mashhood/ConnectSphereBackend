import mongoose from "mongoose";
import { IGroup } from "../Interfaces/Models/i-group";
declare const Group: mongoose.Model<IGroup, {}, {}, {}, mongoose.Document<unknown, {}, IGroup> & IGroup & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Group;
//# sourceMappingURL=group-model.d.ts.map