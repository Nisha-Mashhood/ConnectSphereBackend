import mongoose from "mongoose";
import { IGroupRequest } from "../Interfaces/Models/i-group-request";
declare const GroupRequest: mongoose.Model<IGroupRequest, {}, {}, {}, mongoose.Document<unknown, {}, IGroupRequest> & IGroupRequest & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default GroupRequest;
//# sourceMappingURL=group-request-model.d.ts.map