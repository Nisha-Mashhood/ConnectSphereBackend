import { Server, Socket } from "socket.io";
import { IAppNotification } from "../Interfaces/Models/i-app-notification";
import { TaskNotificationPayload } from "../Utils/types/notification-types";
import { INotificationSocketHandler } from "../Interfaces/Services/i-notification-socket-handler";
import { INotificationService } from "../Interfaces/Services/i-notification-service";
export declare class NotificationSocketHandler implements INotificationSocketHandler {
    private _notificationService;
    private _io;
    constructor(notificationService: INotificationService);
    initializeSocket(io: Server): void;
    handleNotificationRead(socket: Socket, data: {
        notificationId?: string;
        userId?: string;
        type?: IAppNotification['type'];
    }): Promise<void>;
    emitTaskNotification(notification: TaskNotificationPayload): void;
}
//# sourceMappingURL=notification-socket-handler.d.ts.map