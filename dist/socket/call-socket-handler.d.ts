import { Server, Socket } from "socket.io";
import { CallData } from "../Utils/types/socket-service-types";
import { ICallSocketHandler } from "../Interfaces/Services/i-call-socket-handler";
import { IContactRepository } from "../Interfaces/Repository/i-contact-repositry";
import { IGroupRepository } from "../Interfaces/Repository/i-group-repositry";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { INotificationService } from "../Interfaces/Services/i-notification-service";
import { ICallLogRepository } from "../Interfaces/Repository/i-call-repositry";
export declare class CallSocketHandler implements ICallSocketHandler {
    private _activeOffers;
    private _endedCalls;
    private _contactsRepo;
    private _groupRepo;
    private _userRepo;
    private _notificationService;
    private _callLogRepo;
    private _io;
    constructor(contactsRepo: IContactRepository, groupRepo: IGroupRepository, userRepo: IUserRepository, notificationService: INotificationService, callLogRepo: ICallLogRepository);
    setIo(io: Server): void;
    handleOffer(socket: Socket, data: CallData): Promise<void>;
    handleAnswer(socket: Socket, data: CallData): Promise<void>;
    handleIceCandidate(socket: Socket, data: CallData): Promise<void>;
    handleCallEnded(socket: Socket, data: CallData): Promise<void>;
}
//# sourceMappingURL=call-socket-handler.d.ts.map