"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toNotificationDTO = toNotificationDTO;
exports.toNotificationDTOs = toNotificationDTOs;
const user_mapper_1 = require("./user-mapper");
const logger_1 = __importDefault(require("../../core/utils/logger"));
const mongoose_1 = require("mongoose");
function toNotificationDTO(notification) {
    if (!notification) {
        logger_1.default.warn('Attempted to map null notification to DTO');
        return null;
    }
    //userId (populated IUser or just an ID)
    let userId;
    let user;
    if (notification.userId) {
        if (typeof notification.userId === 'string') {
            userId = notification.userId;
        }
        else if (notification.userId instanceof mongoose_1.Types.ObjectId) {
            userId = notification.userId.toString();
        }
        else {
            //IUser object (populated)
            userId = notification.userId._id.toString();
            const userDTO = (0, user_mapper_1.toUserDTO)(notification.userId);
            user = userDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Notification ${notification._id} has no userId`);
        userId = '';
    }
    //senderId (populated IUser or just an ID)
    let senderId;
    let sender;
    if (notification.senderId) {
        if (typeof notification.senderId === 'string') {
            senderId = notification.senderId;
        }
        else if (notification.senderId instanceof mongoose_1.Types.ObjectId) {
            senderId = notification.senderId.toString();
        }
        else {
            //IUser object (populated)
            senderId = notification.senderId._id.toString();
            const senderDTO = (0, user_mapper_1.toUserDTO)(notification.senderId);
            sender = senderDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Notification ${notification._id} has no senderId`);
        senderId = '';
    }
    return {
        id: notification._id.toString(),
        AppNotificationId: notification.AppNotificationId,
        userId,
        user,
        type: notification.type,
        content: notification.content,
        relatedId: notification.relatedId,
        senderId,
        sender,
        status: notification.status,
        callId: notification.callId,
        callType: notification.callType,
        notificationDate: notification.notificationDate?.toISOString().split('T')[0],
        notificationTime: notification.notificationTime,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        taskContext: notification.taskContext
            ? {
                contextType: notification.taskContext.contextType,
                contextId: notification.taskContext.contextId,
            }
            : undefined,
    };
}
function toNotificationDTOs(notifications) {
    return notifications
        .map(toNotificationDTO)
        .filter((dto) => dto !== null);
}
//# sourceMappingURL=notification-mapper.js.map