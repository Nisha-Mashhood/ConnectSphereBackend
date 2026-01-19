import { Document, Types } from "mongoose";
import { IGroup } from "./i-group";
import { IUser } from "./i-user";
export interface IGroupRequest extends Document {
    _id: Types.ObjectId;
    groupRequestId: string;
    groupId: Types.ObjectId | IGroup;
    userId: Types.ObjectId | IUser;
    status: "Pending" | "Accepted" | "Rejected";
    paymentStatus: "Pending" | "Completed" | "Failed";
    paymentId?: string;
    amountPaid?: number;
    createdAt: Date;
}
//# sourceMappingURL=i-group-request.d.ts.map