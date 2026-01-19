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
exports.NotificationController = void 0;
const inversify_1 = require("inversify");
const logger_1 = __importDefault(require("../core/utils/logger"));
const status_code_enums_1 = require("../enums/status-code-enums");
const base_controller_1 = require("../core/controller/base-controller");
const error_handler_1 = require("../core/utils/error-handler");
const error_messages_1 = require("../constants/error-messages");
const messages_1 = require("../constants/messages");
let NotificationController = class NotificationController extends base_controller_1.BaseController {
    constructor(notificationService) {
        super();
        this.getNotifications = async (req, res, next) => {
            try {
                const userId = req.query.userId;
                logger_1.default.debug(`Fetching notifications for user: ${userId}`);
                if (!userId) {
                    logger_1.default.error("Missing userId");
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (!req.currentUser || req.currentUser.role === "admin") {
                    logger_1.default.info(`No notifications for ${req.currentUser ? "admin" : "unauthenticated user"}, userId: ${userId}`);
                    this.sendSuccess(res, [], messages_1.NOTIFICATION_MESSAGES.NO_NOTIFICATIONS_AVAILABLE);
                    return;
                }
                const notifications = await this._notificationService.getNotifications(userId);
                this.sendSuccess(res, notifications, messages_1.NOTIFICATION_MESSAGES.NOTIFICATIONS_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error fetching notifications: ${error.message}`);
                next(error);
            }
        };
        this.markAsRead = async (req, res, next) => {
            try {
                const notificationId = req.query.notificationId;
                const userId = req.query.userId;
                const type = req.query.type;
                logger_1.default.info(`Notification Id ${notificationId} userId ${userId} type ${type}`);
                if (type && (!req.currentUser || req.currentUser.role !== "admin")) {
                    logger_1.default.info(`No action for ${req.currentUser ? "non-admin" : "unauthenticated user"} marking notifications by type: ${type}`);
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.ONLY_ADMINS_CAN_MARK_BY_TYPE, status_code_enums_1.StatusCodes.FORBIDDEN);
                }
                if (type && !userId) {
                    logger_1.default.error("userId is required when marking notifications by type");
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID_FOR_TYPE, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const result = await this._notificationService.markNotificationAsRead(notificationId, userId, type);
                this.sendSuccess(res, result || [], notificationId
                    ? messages_1.NOTIFICATION_MESSAGES.NOTIFICATION_MARKED_AS_READ
                    : messages_1.NOTIFICATION_MESSAGES.NOTIFICATIONS_MARKED_AS_READ);
            }
            catch (error) {
                logger_1.default.error(`Error marking notification(s) as read: ${error.message}`);
                next(error);
            }
        };
        this.getUnreadCount = async (req, res, next) => {
            try {
                const userId = req.query.userId;
                const type = req.query.type;
                logger_1.default.debug(`Fetching unread notification count for user: ${userId}${type ? `, type: ${type}` : ""}`);
                if (!userId) {
                    logger_1.default.error("Missing userId");
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (!req.currentUser) {
                    logger_1.default.info(`No unread count for unauthenticated user, userId: ${userId}`);
                    this.sendSuccess(res, { count: 0 }, messages_1.NOTIFICATION_MESSAGES.NO_NOTIFICATIONS_AVAILABLE);
                    return;
                }
                const count = await this._notificationService.getUnreadCount(userId, type);
                this.sendSuccess(res, { count }, messages_1.NOTIFICATION_MESSAGES.UNREAD_COUNT_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error fetching unread notification count: ${error.message}`);
                next(error);
            }
        };
        this._notificationService = notificationService;
    }
};
exports.NotificationController = NotificationController;
exports.NotificationController = NotificationController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('INotificationService')),
    __metadata("design:paramtypes", [Object])
], NotificationController);
//# sourceMappingURL=notification-controller.js.map