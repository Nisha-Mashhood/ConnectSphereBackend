import { Server, Socket } from "socket.io";
import { EventEmitter } from "events";
import { ISocketService } from "../Interfaces/Services/i-socket-service";
import { IChatSocketHandler } from "../Interfaces/Services/i-chat-socket-handler";
import { ICallSocketHandler } from "../Interfaces/Services/i-call-socket-handler";
import { INotificationSocketHandler } from "../Interfaces/Services/i-notification-socket-handler";
export declare class SocketService implements ISocketService {
    private _io;
    static notificationEmitter: EventEmitter;
    private _chatHandler;
    private _callHandler;
    private _notificationHandler;
    constructor(chatHandler: IChatSocketHandler, callHandler: ICallSocketHandler, notificationHandler: INotificationSocketHandler);
    initialize(io: Server): void;
    private handleConnection;
    handleDisconnect(socket: Socket): void;
}
//# sourceMappingURL=socket-service.d.ts.map