import { IUserDTO } from "./i-user-dto";
export interface IUserConnectionDTO {
    id: string;
    connectionId: string;
    requesterId: string;
    requester?: IUserDTO;
    recipientId: string;
    recipient?: IUserDTO;
    requestStatus: "Pending" | "Accepted" | "Rejected";
    connectionStatus: "Connected" | "Disconnected";
    requestSentAt: Date;
    requestAcceptedAt?: Date;
    disconnectedAt?: Date;
    disconnectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=i-user-connection-dto.d.ts.map