import { IAppNotification } from "../Interfaces/Models/i-app-notification";
import { Server } from "socket.io";
import { INotificationService } from "../Interfaces/Services/i-notification-service";
import { TaskNotificationPayload } from "../Utils/types/notification-types";
import { INotificationRepository } from "../Interfaces/Repository/i-notification-repositry";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { IGroupRepository } from "../Interfaces/Repository/i-group-repositry";
import { ICollaborationRepository } from "../Interfaces/Repository/i-collaboration-repositry";
import { IAppNotificationDTO } from "../Interfaces/DTOs/i-app-notification-dto";
export declare class NotificationService implements INotificationService {
    private _notificationRepository;
    private _groupRepository;
    private _userRepository;
    private _collaborationRepository;
    private intervalId;
    constructor(notificationRepository: INotificationRepository, groupRepository: IGroupRepository, userRepository: IUserRepository, collaborationRepository: ICollaborationRepository);
    initializeSocket(_io: Server): void;
    private startNotificationInterval;
    stopNotificationInterval(): void;
    sendTaskNotification: (taskId: string, specificUserId?: string, notificationDate?: string, notificationTime?: string) => Promise<TaskNotificationPayload[]>;
    checkAndSendNotifications: () => Promise<TaskNotificationPayload[]>;
    sendNotification: (userId: string, notificationType: IAppNotification["type"], senderId: string, relatedId: string, contentType?: string, callId?: string, callType?: IAppNotification["callType"], customContent?: string) => Promise<IAppNotificationDTO>;
    updateCallNotificationToMissed: (userId: string, callId: string, content: string) => Promise<IAppNotificationDTO | null>;
    getNotifications: (userId: string) => Promise<IAppNotificationDTO[]>;
    markNotificationAsRead: (notificationId?: string, userId?: string, type?: IAppNotification["type"]) => Promise<IAppNotificationDTO[]>;
    getUnreadCount: (userId: string, type?: IAppNotification["type"]) => Promise<number>;
}
//# sourceMappingURL=notification-service.d.ts.map