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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const notification_model_1 = require("../Models/notification-model");
const task_model_1 = require("../Models/task-model");
const status_code_enums_1 = require("../enums/status-code-enums");
let NotificationRepository = class NotificationRepository extends base_repositry_1.BaseRepository {
    constructor() {
        super(notification_model_1.AppNotificationModel);
        this.toObjectId = (id) => {
            if (!id) {
                logger_1.default.warn('Missing ID when converting to ObjectId');
                throw new error_handler_1.RepositoryError('Invalid ID: ID is required', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            const idStr = typeof id === 'string' ? id : id.toString();
            if (!mongoose_1.Types.ObjectId.isValid(idStr)) {
                logger_1.default.warn(`Invalid ObjectId format: ${idStr}`);
                throw new error_handler_1.RepositoryError('Invalid ID: must be a 24 character hex string', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            return new mongoose_1.Types.ObjectId(idStr);
        };
        this.getTasksForNotification = async (taskId) => {
            try {
                logger_1.default.debug(`Fetching task for notification: ${taskId}`);
                const task = await task_model_1.Task.findOne({
                    _id: this.toObjectId(taskId),
                    status: { $ne: "completed" },
                    dueDate: { $gte: new Date() },
                    notificationDate: { $lte: new Date() },
                }).exec();
                logger_1.default.info(`Task ${task ? 'found' : 'not found'} for notification: ${taskId}`);
                return task;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching task for notification ${taskId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching task for notification', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllTasksForNotification = async () => {
            try {
                logger_1.default.debug("Fetching all tasks for notification");
                const tasks = await task_model_1.Task.find({
                    status: { $ne: "completed" },
                    dueDate: { $gte: new Date() },
                    notificationDate: { $lte: new Date() },
                    notificationTime: { $exists: true },
                }).exec();
                logger_1.default.info(`Fetched ${tasks.length} tasks for notification`);
                return tasks;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching all tasks for notification`, err);
                throw new error_handler_1.RepositoryError('Error fetching all tasks for notification', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findTaskNotification = async (userId, taskId, notificationDate, notificationTime) => {
            try {
                logger_1.default.debug(`Finding task notification for user: ${userId}, task: ${taskId}`);
                const notification = await this.model
                    .findOne({
                    userId: this.toObjectId(userId),
                    type: "task_reminder",
                    relatedId: taskId,
                    notificationDate: notificationDate ? new Date(notificationDate) : undefined,
                    notificationTime,
                })
                    .exec();
                logger_1.default.info(`Task notification ${notification ? 'found' : 'not found'} for user: ${userId}, task: ${taskId}`);
                return notification;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error finding task notification for user ${userId}, task ${taskId}`, err);
                throw new error_handler_1.RepositoryError('Error finding task notification', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateNotificationStatus = async (notificationId, status) => {
            try {
                logger_1.default.debug(`Updating notification status: ${notificationId} to ${status}`);
                const notification = await this.model
                    .findByIdAndUpdate(this.toObjectId(notificationId), { status, updatedAt: new Date() }, { new: true })
                    .exec();
                if (!notification) {
                    logger_1.default.warn(`Notification not found: ${notificationId}`);
                    throw new error_handler_1.RepositoryError(`Notification not found with ID: ${notificationId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Notification status updated: ${notificationId} to ${status}`);
                return notification;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating notification status for ID ${notificationId}`, err);
                throw new error_handler_1.RepositoryError('Error updating notification status', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateTaskNotifications = async (relatedId, notificationDate, notificationTime) => {
            try {
                logger_1.default.debug(`Updating task notifications for task: ${relatedId}`);
                const updateData = {
                    ...(notificationDate && { notificationDate: new Date(notificationDate) }),
                    ...(notificationTime && { notificationTime }),
                    updatedAt: new Date(),
                };
                const result = await this.model
                    .updateMany({ relatedId, type: "task_reminder" }, { $set: updateData })
                    .exec();
                logger_1.default.info(`Updated ${result.modifiedCount} task notifications for task: ${relatedId}`);
                return { modifiedCount: result.modifiedCount };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating task notifications for task ${relatedId}`, err);
                throw new error_handler_1.RepositoryError('Error updating task notifications', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.createNotification = async (notification) => {
            try {
                logger_1.default.debug(`Creating notification for user: ${notification.userId}`);
                const newNotification = await this.create({
                    ...notification,
                    userId: notification.userId ? this.toObjectId(notification.userId) : undefined,
                    senderId: notification.senderId ? this.toObjectId(notification.senderId) : undefined,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                logger_1.default.info(`Notification created: ${newNotification._id}`);
                return newNotification;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating notification for user ${notification.userId}`, err);
                throw new error_handler_1.RepositoryError('Error creating notification', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findNotificationByUserId = async (userId) => {
            try {
                logger_1.default.debug(`Fetching notifications for user: ${userId}`);
                const notifications = await this.model
                    .find({ userId: this.toObjectId(userId) })
                    .sort({ createdAt: -1 })
                    .limit(50)
                    .exec();
                logger_1.default.info(`Fetched ${notifications.length} notifications for user: ${userId}`);
                return notifications;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching notifications for user ${userId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching notifications by user ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findNotificationByCallId = async (userId, callId) => {
            try {
                logger_1.default.debug(`Finding notification by call ID: ${callId} for user: ${userId}`);
                const notification = await this.model
                    .findOne({
                    userId: this.toObjectId(userId),
                    callId,
                    type: "incoming_call",
                    status: "unread",
                })
                    .exec();
                logger_1.default.info(`Notification ${notification ? 'found' : 'not found'} for callId: ${callId}, user: ${userId}`);
                return notification;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error finding notification by call ID ${callId} for user ${userId}`, err);
                throw new error_handler_1.RepositoryError('Error finding notification by call ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateNotificationToMissed = async (userId, callId, content) => {
            try {
                logger_1.default.debug(`Updating notification to missed call for user: ${userId}, call: ${callId}`);
                const notification = await this.model
                    .findOneAndUpdate({
                    userId: this.toObjectId(userId),
                    callId,
                    type: "incoming_call",
                    status: "unread",
                }, { type: "missed_call", content, updatedAt: new Date() }, { new: true })
                    .exec();
                if (!notification) {
                    logger_1.default.warn(`Notification not found for callId: ${callId}, user: ${userId}`);
                    throw new error_handler_1.RepositoryError(`Notification not found for callId: ${callId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Notification updated to missed call: ${notification._id}`);
                return notification;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating notification to missed for callId ${callId}, user ${userId}`, err);
                throw new error_handler_1.RepositoryError('Error updating notification to missed', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.markNotificationAsRead = async (notificationId) => {
            try {
                logger_1.default.debug(`Marking notification as read: ${notificationId}`);
                const notification = await this.model
                    .findByIdAndUpdate(this.toObjectId(notificationId), { status: "read", updatedAt: new Date() }, { new: true })
                    .exec();
                if (!notification) {
                    logger_1.default.warn(`Notification not found: ${notificationId}`);
                    throw new error_handler_1.RepositoryError(`Notification not found with ID: ${notificationId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Notification marked as read: ${notificationId}`);
                return notification;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error marking notification as read for ID ${notificationId}`, err);
                throw new error_handler_1.RepositoryError('Error marking notification as read', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getNotificationUnreadCount = async (userId, type) => {
            try {
                logger_1.default.debug(`Fetching unread notification count for user: ${userId}${type ? `, type: ${type}` : ""}`);
                const query = { userId: this.toObjectId(userId), status: "unread" };
                if (type) {
                    query.type = type;
                }
                const count = await this.model.countDocuments(query).exec();
                logger_1.default.info(`Fetched unread notification count: ${count} for user: ${userId}${type ? `, type: ${type}` : ""}`);
                return count;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching unread notification count for user ${userId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching unread notification count', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findNotificationByRelatedId = async (relatedId, options) => {
            try {
                logger_1.default.debug(`Fetching notification by relatedId: ${relatedId} for user: ${options.userId}`);
                const notification = await this.model
                    .findOne({
                    relatedId,
                    userId: this.toObjectId(options.userId),
                    type: options.type,
                })
                    .exec();
                logger_1.default.info(notification
                    ? `Found notification with ID: ${notification._id} for relatedId: ${relatedId}`
                    : `No notification found for relatedId: ${relatedId}`);
                return notification;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching notification by relatedId ${relatedId} for user ${options.userId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching notification by relatedId', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateNotificationById = async (notificationId, updateData) => {
            try {
                logger_1.default.debug(`Updating notification with ID: ${notificationId}`);
                const notification = await this.model
                    .findByIdAndUpdate(this.toObjectId(notificationId), { $set: updateData }, { new: true })
                    .exec();
                if (!notification) {
                    logger_1.default.warn(`Notification not found: ${notificationId}`);
                    throw new error_handler_1.RepositoryError(`Notification not found with ID: ${notificationId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Updated notification: ${notificationId}`);
                return notification;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating notification with ID ${notificationId}`, err);
                throw new error_handler_1.RepositoryError('Error updating notification', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
    }
};
exports.NotificationRepository = NotificationRepository;
exports.NotificationRepository = NotificationRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], NotificationRepository);
//# sourceMappingURL=notification-repository.js.map