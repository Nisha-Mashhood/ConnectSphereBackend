import { Server, Socket } from "socket.io";
import { MarkAsReadData, Message, TypingData } from "./types";
import { IContactRepository } from "../Interfaces/Repository/i-contact-repositry";
import { IGroupRepository } from "../Interfaces/Repository/i-group-repositry";
import { IChatRepository } from "../Interfaces/Repository/i-chat-repositry";
import { INotificationService } from "../Interfaces/Services/i-notification-service";
import { ICollaborationRepository } from "../Interfaces/Repository/i-collaboration-repositry";
export declare class ChatSocketHandler {
    private _activeChats;
    private _contactsRepo;
    private _groupRepo;
    private _chatRepo;
    private _collabRepository;
    private _notificationService;
    private _io;
    constructor(contactsRepo: IContactRepository, groupRepo: IGroupRepository, chatRepo: IChatRepository, collaboartionRepository: ICollaborationRepository, notificationService: INotificationService);
    setIo(io: Server): void;
    handleJoinChats(socket: Socket, userId: string): Promise<void>;
    handleJoinUserRoom(socket: Socket, userId: string): void;
    handleEnsureUserRoom(socket: Socket, data: {
        userId: string;
    }): void;
    handleLeaveUserRoom(socket: Socket, userId: string): void;
    handleActiveChat(data: {
        userId: string;
        chatKey: string;
    }): void;
    handleSendMessage(socket: Socket, message: Message): Promise<void>;
    handleTyping(socket: Socket, data: TypingData): void;
    handleStopTyping(socket: Socket, data: TypingData): void;
    handleMarkAsRead(socket: Socket, data: MarkAsReadData): Promise<void>;
    handleLeaveChat(userId: string): void;
}
//# sourceMappingURL=chat-socket-handler.d.ts.map