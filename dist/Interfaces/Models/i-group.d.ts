import { Document, Types } from "mongoose";
import { IUser } from "./i-user";
export interface TimeSlot {
    day: string;
    timeSlots: string[];
}
export interface IGroup extends Document {
    _id: Types.ObjectId;
    groupId: string;
    name: string;
    bio: string;
    price: number;
    maxMembers: number;
    isFull: boolean;
    availableSlots: TimeSlot[];
    profilePic: string;
    coverPic: string;
    startDate: Date;
    adminId: Types.ObjectId | IUser;
    members: {
        userId: Types.ObjectId | IUser;
        joinedAt: Date;
    }[];
    createdAt: Date;
}
//# sourceMappingURL=i-group.d.ts.map