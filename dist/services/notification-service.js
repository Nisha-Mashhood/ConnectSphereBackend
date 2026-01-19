"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const socket_service_1 = require("../socket/socket-service");
const helper_1 = require("../Utils/utils/notification-utils/helper");
const status_code_enums_1 = require("../enums/status-code-enums");
const notification_mapper_1 = require("../Utils/mappers/notification-mapper");
let io = null;
let NotificationService = class NotificationService {
    constructor(notificationRepository, groupRepository, userRepository, collaborationRepository) {
        this.intervalId = null;
        this.sendTaskNotification = async (taskId, specificUserId, notificationDate, notificationTime) => {
            try {
                logger_1.default.debug(`Sending task notification for task: ${taskId}`);
                const notifications = [];
                const task = await this._notificationRepository.getTasksForNotification(taskId);
                if (!task) {
                    logger_1.default.warn(`No task found for ID ${taskId}`);
                    return notifications;
                }
                logger_1.default.info(`Task Found For Notification : ${task}`);
                const currentTime = new Date();
                if (task.status === "completed") {
                    logger_1.default.info(`Skipping task ${task.taskId}: Task completed`);
                    return notifications;
                }
                if (new Date(task.dueDate) < currentTime) {
                    logger_1.default.info(`Skipping task ${task.taskId}: Due date passed (${task.dueDate})`);
                    return notifications;
                }
                let isTimeToNotify = false;
                if (task.notificationDate && task.notificationTime) {
                    const taskNotificationDate = new Date(task.notificationDate);
                    const isSameDay = currentTime.getDate() === taskNotificationDate.getDate() &&
                        currentTime.getMonth() === taskNotificationDate.getMonth() &&
                        currentTime.getFullYear() === taskNotificationDate.getFullYear();
                    if (isSameDay) {
                        const time24 = (0, helper_1.convertTo24HourFormat)(task.notificationTime);
                        if (time24) {
                            const taskNotificationTime = new Date(currentTime);
                            taskNotificationTime.setHours(time24.hours, time24.minutes, 0, 0);
                            const timeDiff = Math.abs(currentTime.getTime() - taskNotificationTime.getTime());
                            isTimeToNotify = timeDiff <= 60 * 1000; // ±1 minute window
                        }
                    }
                }
                else {
                    logger_1.default.warn(`Task ${task.taskId} missing notificationDate or notificationTime`);
                    return notifications;
                }
                if (!isTimeToNotify) {
                    logger_1.default.info(`Skipping task ${task.taskId}: Not time to notify`);
                    return notifications;
                }
                let recipients = [];
                if (specificUserId) {
                    recipients = [specificUserId];
                }
                else if (task.contextType === "collaboration") {
                    const collaborationIds = await this._collaborationRepository.getMentorIdAndUserId(task.contextId.toString());
                    if (collaborationIds) {
                        recipients = [
                            collaborationIds.userId,
                            collaborationIds.mentorUserId,
                        ].filter((id) => id !== null);
                    }
                }
                else if (task.contextType === "group") {
                    const groupMembers = await this._groupRepository.getGroupMembers(task.contextId.toString());
                    recipients = groupMembers.map((member) => member.toString());
                }
                else if (task.contextType === "user") {
                    recipients = [
                        task.createdBy.toString(),
                        ...task.assignedUsers.map((id) => id.toString()),
                    ];
                    recipients = [...new Set(recipients)];
                }
                logger_1.default.debug(`Recipients for task ${task._id}: ${JSON.stringify(recipients)}`);
                if (recipients.length === 0) {
                    logger_1.default.warn(`No recipients for task ${task.taskId}`);
                    return notifications;
                }
                const assigner = await this._userRepository.findById(task.createdBy.toString());
                const assignerName = assigner?.name || "Unknown";
                for (const userId of recipients) {
                    let isConnected = false;
                    if (io) {
                        const room = `user_${userId}`;
                        const socketsInRoom = await io.in(room).allSockets();
                        isConnected = socketsInRoom.size > 0;
                        logger_1.default.debug(`User ${userId} connected for task ${task.taskId}: ${isConnected}`);
                    }
                    let notification = await this._notificationRepository.findTaskNotification(userId, task._id.toString(), notificationDate, notificationTime);
                    if (notification && notification.status === "read") {
                        notification = await this._notificationRepository.updateNotificationStatus(notification._id.toString(), "unread");
                    }
                    if (!notification) {
                        const isAssigner = userId === task.createdBy.toString();
                        const content = isAssigner
                            ? `Reminder: Your task "${task.name}" is due soon`
                            : `Reminder: Task "${task.name}" assigned by ${assignerName} is due soon`;
                        const notificationData = {
                            userId,
                            type: "task_reminder",
                            content,
                            relatedId: task._id.toString(),
                            senderId: task.createdBy,
                            status: "unread",
                            notificationDate: notificationDate
                                ? new Date(notificationDate)
                                : undefined,
                            notificationTime,
                            taskContext: {
                                contextType: task.contextType,
                                contextId: task.contextId.toString(),
                            },
                        };
                        notification = await this._notificationRepository.createNotification(notificationData);
                        if (!notification) {
                            logger_1.default.warn(`Failed to create notification for user ${userId} on task ${taskId}`);
                            continue;
                        }
                    }
                    const payload = {
                        _id: notification._id.toString(),
                        userId: notification.userId.toString(),
                        type: notification.type,
                        content: notification.content,
                        relatedId: notification.relatedId,
                        senderId: notification.senderId.toString(),
                        status: notification.status,
                        callId: notification.callId,
                        notificationDate: notification.notificationDate
                            ?.toISOString()
                            .split("T")[0],
                        notificationTime: notification.notificationTime,
                        createdAt: notification.createdAt,
                        updatedAt: notification.updatedAt,
                        taskContext: notification.taskContext,
                    };
                    notifications.push(payload);
                    if (isConnected && io) {
                        socket_service_1.SocketService.notificationEmitter.emit("notification", payload);
                        logger_1.default.info(`Emitted notification ${notification._id} to user ${userId} for task ${task.taskId}`);
                    }
                    else {
                        logger_1.default.info(`Stored notification ${notification._id} for offline user ${userId} on task ${task.taskId}`);
                    }
                }
                return notifications;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error sending task notification for task ${taskId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to send task notification", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.checkAndSendNotifications = async () => {
            try {
                logger_1.default.debug("Checking and sending notifications");
                const allNotifications = [];
                const tasks = await this._notificationRepository.getAllTasksForNotification();
                const currentTime = new Date();
                for (const task of tasks) {
                    if (!task.notificationDate ||
                        !task.notificationTime ||
                        task.status === "completed" ||
                        new Date(task.dueDate) < currentTime) {
                        continue;
                    }
                    const notifications = await this.sendTaskNotification(task._id.toString(), undefined, task.notificationDate.toISOString().split("T")[0], task.notificationTime);
                    allNotifications.push(...notifications);
                }
                return allNotifications;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error checking and sending notifications: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to check and send notifications", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.sendNotification = async (userId, notificationType, senderId, relatedId, contentType, callId, callType, customContent) => {
            try {
                logger_1.default.debug(`Sending notification to user: ${userId}, type: ${notificationType}`);
                if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(senderId) || !mongoose_1.Types.ObjectId.isValid(relatedId)) {
                    logger_1.default.error("Invalid user ID, sender ID, or related ID");
                    throw new error_handler_1.ServiceError("User ID, sender ID, and related ID must be valid ObjectIds", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const validTypes = [
                    "message",
                    "incoming_call",
                    "missed_call",
                    "task_reminder",
                    "new_user",
                    "new_mentor",
                    "mentor_approved",
                    "collaboration_status",
                ];
                if (!validTypes.includes(notificationType)) {
                    logger_1.default.error(`Invalid notification type: ${notificationType}`);
                    throw new error_handler_1.ServiceError(`Notification type must be one of: ${validTypes.join(", ")}`, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (contentType) {
                    const validContextTypes = ["user", "group", "collaboration", "userconnection"];
                    if (!validContextTypes.includes(contentType)) {
                        logger_1.default.error(`Invalid content type: ${contentType}`);
                        throw new error_handler_1.ServiceError(`Content type must be one of: ${validContextTypes.join(", ")}`, status_code_enums_1.StatusCodes.BAD_REQUEST);
                    }
                }
                if (callType) {
                    const validCallTypes = ["audio", "video"];
                    if (!validCallTypes.includes(callType)) {
                        logger_1.default.error(`Invalid call type: ${callType}`);
                        throw new error_handler_1.ServiceError(`Call type must be one of: ${validCallTypes.join(", ")}`, status_code_enums_1.StatusCodes.BAD_REQUEST);
                    }
                }
                const sender = await this._userRepository.findById(senderId);
                if (!sender) {
                    logger_1.default.warn(`Sender not found: ${senderId}`);
                    throw new error_handler_1.ServiceError("Sender not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                let content;
                // Use customContent if provided, otherwise generate default content
                if (customContent) {
                    content = customContent;
                }
                else if (notificationType === "message") {
                    content = `New ${contentType || "text"} message from ${sender?.name || senderId}`;
                }
                else if (notificationType === "incoming_call") {
                    content = `Incoming ${contentType || "call"} call from ${sender?.name || senderId}`;
                }
                else if (notificationType === "missed_call") {
                    content = `Missed ${contentType || "call"} call from ${sender?.name || senderId}`;
                }
                else if (notificationType === "new_user") {
                    content = `New user registered: ${sender?.email || senderId}`;
                }
                else if (notificationType === "new_mentor") {
                    content = `New mentor registered: ${sender?.email || senderId}`;
                }
                else if (notificationType === "mentor_approved") {
                    content = `Mentor approval status updated for ${sender?.email || senderId}`;
                }
                else if (notificationType === "collaboration_status") {
                    content = `Collaboration status updated with ${sender?.name || senderId}`;
                }
                else {
                    const task = await this._notificationRepository.getTasksForNotification(relatedId);
                    if (!task) {
                        content = `Task reminder from ${sender?.name || senderId}`;
                    }
                    else {
                        const isAssigner = userId === senderId;
                        content = isAssigner
                            ? `Reminder: Your task "${task.name}" is due soon`
                            : `Reminder: Task "${task.name}" assigned by ${sender?.name || senderId} is due soon`;
                    }
                }
                const notificationData = {
                    userId,
                    type: notificationType,
                    content,
                    relatedId,
                    senderId,
                    status: "unread",
                    callId,
                    callType,
                    taskContext: contentType
                        ? {
                            contextType: contentType,
                            contextId: relatedId,
                        }
                        : undefined,
                };
                const notification = await this._notificationRepository.createNotification(notificationData);
                if (!notification) {
                    logger_1.default.error(`Failed to create notification for user ${userId}`);
                    throw new error_handler_1.ServiceError("Failed to create notification", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                const notificationDTO = (0, notification_mapper_1.toNotificationDTO)(notification);
                if (!notificationDTO) {
                    logger_1.default.error(`Failed to map notification ${notification._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map notification to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                if (io) {
                    const socketsInRoom = await io.in(`user_${userId}`).allSockets();
                    if (socketsInRoom.size > 0) {
                        const payload = {
                            _id: notificationDTO.id,
                            userId: notificationDTO.userId,
                            type: notificationDTO.type,
                            content: notificationDTO.content,
                            relatedId: notificationDTO.relatedId,
                            senderId: notificationDTO.senderId,
                            status: notificationDTO.status,
                            callId: notificationDTO.callId,
                            callType: notificationDTO.callType,
                            notificationDate: notificationDTO.notificationDate,
                            notificationTime: notificationDTO.notificationTime,
                            createdAt: notificationDTO.createdAt,
                            updatedAt: notificationDTO.updatedAt,
                            taskContext: notificationDTO.taskContext,
                        };
                        socket_service_1.SocketService.notificationEmitter.emit("notification", payload);
                        logger_1.default.info(`Emitted notification ${notification._id} to user ${userId}`);
                    }
                    else {
                        logger_1.default.info(`User ${userId} not connected, stored notification ${notification._id}`);
                    }
                }
                return notificationDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error sending notification to user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to send notification", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateCallNotificationToMissed = async (userId, callId, content) => {
            try {
                logger_1.default.debug(`Updating call notification to missed for user: ${userId}, call: ${callId}`);
                if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                    logger_1.default.error("Invalid user ID or call ID");
                    throw new error_handler_1.ServiceError("User ID and call ID must be valid ObjectIds", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (!content || content.trim() === "") {
                    logger_1.default.error("Content is required for missed call notification");
                    throw new error_handler_1.ServiceError("Content is required for missed call notification", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const notification = await this._notificationRepository.updateNotificationToMissed(userId, callId, content);
                if (!notification) {
                    logger_1.default.warn(`No notification found for user ${userId} and call ${callId}`);
                    throw new error_handler_1.ServiceError("Notification not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const notificationDTO = (0, notification_mapper_1.toNotificationDTO)(notification);
                if (!notificationDTO) {
                    logger_1.default.error(`Failed to map notification ${notification._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map notification to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                if (io) {
                    const payload = {
                        _id: notificationDTO.id,
                        userId: notificationDTO.userId,
                        type: notificationDTO.type,
                        content: notificationDTO.content,
                        relatedId: notificationDTO.relatedId,
                        senderId: notificationDTO.senderId,
                        status: notificationDTO.status,
                        callId: notificationDTO.callId,
                        notificationDate: notificationDTO.notificationDate,
                        notificationTime: notificationDTO.notificationTime,
                        createdAt: notificationDTO.createdAt,
                        updatedAt: notificationDTO.updatedAt,
                        taskContext: notificationDTO.taskContext,
                    };
                    try {
                        socket_service_1.SocketService.notificationEmitter.emit("notification.updated", payload);
                    }
                    catch (socketError) {
                        logger_1.default.error(`Socket emission error: ${socketError.message}`);
                    }
                }
                return notificationDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating call notification to missed for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to update call notification to missed", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getNotifications = async (userId) => {
            try {
                logger_1.default.debug(`Fetching notifications for user: ${userId}`);
                const notifications = await this._notificationRepository.findNotificationByUserId(userId);
                const notificationDTOs = (0, notification_mapper_1.toNotificationDTOs)(notifications);
                logger_1.default.info(`Fetched ${notificationDTOs.length} notifications for user: ${userId}`);
                return notificationDTOs;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching notifications for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch notifications", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        // Marks a single notification or all notifications of a specific type as read
        this.markNotificationAsRead = async (notificationId, userId, type) => {
            logger_1.default.info(`markNotificationAsRead called with: notificationId=${notificationId}, userId=${userId}, type=${type}`);
            try {
                if (!notificationId && !type) {
                    logger_1.default.error("Either notificationId or type must be provided");
                    throw new error_handler_1.ServiceError("Either notificationId or type must be provided", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (type && !userId) {
                    logger_1.default.error("userId is required when marking notifications by type");
                    throw new error_handler_1.ServiceError("userId is required when marking notifications by type", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (notificationId && !mongoose_1.Types.ObjectId.isValid(notificationId)) {
                    logger_1.default.error("Invalid notification ID");
                    throw new error_handler_1.ServiceError("Notification ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (userId && !mongoose_1.Types.ObjectId.isValid(userId)) {
                    logger_1.default.error("Invalid user ID");
                    throw new error_handler_1.ServiceError("User ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (type) {
                    const validTypes = [
                        "message",
                        "incoming_call",
                        "missed_call",
                        "task_reminder",
                        "new_user",
                        "new_mentor",
                        "mentor_approved",
                        "collaboration_status",
                    ];
                    if (!validTypes.includes(type)) {
                        logger_1.default.error(`Invalid notification type: ${type}`);
                        throw new error_handler_1.ServiceError(`Notification type must be one of: ${validTypes.join(", ")}`, status_code_enums_1.StatusCodes.BAD_REQUEST);
                    }
                }
                const updatedNotifications = [];
                if (notificationId) {
                    const notification = await this._notificationRepository.markNotificationAsRead(notificationId);
                    if (notification) {
                        updatedNotifications.push(notification);
                        logger_1.default.info(`Marked notification ${notificationId} as read`);
                    }
                    else {
                        logger_1.default.warn(`Notification not found: ${notificationId}`);
                        throw new error_handler_1.ServiceError("Notification not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                    }
                }
                else if (userId && type) {
                    const notifications = await this._notificationRepository.findNotificationByUserId(userId);
                    const targetNotifications = notifications.filter((n) => n.type === type && n.status === "unread");
                    logger_1.default.debug(`Found ${targetNotifications.length} unread ${type} notifications for user ${userId}`);
                    for (const notification of targetNotifications) {
                        const updated = await this._notificationRepository.markNotificationAsRead(notification._id.toString());
                        if (updated) {
                            updatedNotifications.push(updated);
                            logger_1.default.debug(`Marked notification ${notification._id} as read`);
                        }
                    }
                    logger_1.default.info(`Marked ${updatedNotifications.length} ${type} notifications as read for user ${userId}`);
                }
                if (updatedNotifications.length === 0) {
                    logger_1.default.warn(`No notifications found for ${notificationId || type}`);
                    throw new error_handler_1.ServiceError("No notifications found to mark as read", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const notificationDTOs = (0, notification_mapper_1.toNotificationDTOs)(updatedNotifications);
                if (notificationDTOs.length === 0) {
                    logger_1.default.error(`Failed to map notifications to DTOs`);
                    throw new error_handler_1.ServiceError("Failed to map notifications to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                return notificationDTOs;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error marking notification(s) as read: ${err.message}`, {
                    notificationId,
                    userId,
                    type,
                    errorDetails: err,
                });
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to mark notification(s) as read", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getUnreadCount = async (userId, type) => {
            try {
                logger_1.default.debug(`Fetching unread notification count for user: ${userId}${type ? `, type: ${type}` : ""}`);
                if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                    logger_1.default.error("Invalid user ID");
                    throw new error_handler_1.ServiceError("User ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (type) {
                    const validTypes = [
                        "message",
                        "incoming_call",
                        "missed_call",
                        "task_reminder",
                        "new_user",
                        "new_mentor",
                        "mentor_approved",
                        "collaboration_status",
                    ];
                    if (!validTypes.includes(type)) {
                        logger_1.default.error(`Invalid notification type: ${type}`);
                        throw new error_handler_1.ServiceError(`Notification type must be one of: ${validTypes.join(", ")}`, status_code_enums_1.StatusCodes.BAD_REQUEST);
                    }
                }
                const count = await this._notificationRepository.getNotificationUnreadCount(userId, type);
                logger_1.default.info(`Fetched unread count ${count} for user ${userId}${type ? `, type: ${type}` : ""}`);
                return count;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching unread notification count for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch unread notification count", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._notificationRepository = notificationRepository;
        this._groupRepository = groupRepository;
        this._userRepository = userRepository;
        this._collaborationRepository = collaborationRepository;
    }
    initializeSocket(_io) {
        io = _io;
        logger_1.default.info("Notification service initialized with Socket.IO");
        this.startNotificationInterval();
    }
    startNotificationInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            logger_1.default.info("Cleared existing notification interval");
        }
        this.intervalId = setInterval(async () => {
            try {
                const notifications = await this.checkAndSendNotifications();
                logger_1.default.info(`Generated ${notifications.length} notifications`);
            }
            catch (error) {
                logger_1.default.error(`Error in periodic notification check: ${error.message}`);
            }
        }, 60 * 1000); // 1 minute
    }
    stopNotificationInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            logger_1.default.info("Notification interval stopped");
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('INotificationRepository')),
    __param(1, (0, inversify_1.inject)('IGroupRepository')),
    __param(2, (0, inversify_1.inject)('IUserRepository')),
    __param(3, (0, inversify_1.inject)('ICollaborationRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], NotificationService);
//# sourceMappingURL=notification-service.js.map