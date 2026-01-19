import { Server, Socket } from "socket.io";
import { IGroupRepository } from "../Interfaces/Repository/i-group-repositry";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { INotificationService } from "../Interfaces/Services/i-notification-service";
import { ICallLogRepository } from "../Interfaces/Repository/i-call-repositry";
interface GroupCallData {
    groupId: string;
    senderId: string;
    recipientId: string;
    callType: "audio" | "video";
    callId: string;
}
interface GroupOfferData extends GroupCallData {
    offer: RTCSessionDescriptionInit;
}
interface GroupAnswerData extends GroupCallData {
    answer: RTCSessionDescriptionInit;
}
interface GroupIceCandidateData extends GroupCallData {
    candidate: RTCIceCandidateInit;
}
interface GroupJoinCallData {
    groupId: string;
    userId: string;
    callType: "audio" | "video";
    callId: string;
}
export declare class GroupCallSocketHandler {
    private _activeOffers;
    private _endedCalls;
    private _joinedUsersByCallId;
    private _groupRepo;
    private _userRepo;
    private _notificationService;
    private _callLogRepo;
    private _io;
    private _groupToCallId;
    constructor(groupRepo: IGroupRepository, userRepo: IUserRepository, notificationService: INotificationService, callLogRepo: ICallLogRepository);
    setIo(io: Server): void;
    getCallIdForGroup(groupId: string): string | undefined;
    handleGroupOffer(socket: Socket, data: GroupOfferData): Promise<void>;
    handleGroupAnswer(socket: Socket, data: GroupAnswerData): Promise<void>;
    handleGroupIceCandidate(socket: Socket, data: GroupIceCandidateData): Promise<void>;
    handleGroupCallEnded(socket: Socket, data: GroupCallData): Promise<void>;
    handleDisconnect(socket: Socket): Promise<void>;
    handleJoinGroupCall(socket: Socket, data: GroupJoinCallData): Promise<void>;
}
export {};
//# sourceMappingURL=group-call-socket-handler.d.ts.map