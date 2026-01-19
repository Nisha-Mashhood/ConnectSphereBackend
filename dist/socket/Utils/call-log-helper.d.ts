import { Socket, Server } from "socket.io";
import { ICallLog } from "../../Interfaces/Models/i-call-log";
import { ICallLogRepository } from "../../Interfaces/Repository/i-call-repositry";
export declare const createCallLog: (socket: Socket, io: Server | null, callLogRepo: ICallLogRepository, data: {
    CallId: string;
    chatKey: string;
    callType: "audio" | "video";
    type: "group" | "user-mentor" | "user-user";
    senderId: string;
    recipientIds: string[];
    groupId?: string;
    callerName: string;
}) => Promise<ICallLog | null>;
export declare const updateCallLog: (socket: Socket, io: Server | null, callLogRepo: ICallLogRepository, callId: string, senderId: string, recipientIds: string[], updateData: Partial<ICallLog>) => Promise<ICallLog | null>;
//# sourceMappingURL=call-log-helper.d.ts.map