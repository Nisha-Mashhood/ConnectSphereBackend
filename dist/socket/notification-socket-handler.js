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
exports.NotificationSocketHandler = void 0;
const logger_1 = __importDefault(require("../core/utils/logger"));
const inversify_1 = require("inversify");
let NotificationSocketHandler = class NotificationSocketHandler {
    constructor(notificationService) {
        this._io = null;
        this._notificationService = notificationService;
    }
    initializeSocket(io) {
        this._io = io;
        this._notificationService.initializeSocket(io);
    }
    async handleNotificationRead(socket, data) {
        try {
            const { notificationId, userId, type } = data;
            const updatedNotifications = await this._notificationService.markNotificationAsRead(notificationId, userId, type);
            if (updatedNotifications.length > 0 && this._io && userId) {
                // Emit to the user that some notifications were read
                this._io.to(`user_${userId}`).emit("notification.read", {
                    notificationIds: updatedNotifications.map(n => n.id),
                });
                logger_1.default.info(`Marked ${updatedNotifications.length} notifications as read for user ${userId}`);
            }
        }
        catch (error) {
            logger_1.default.error(`Error handling notification.read: ${error.message}`);
            socket.emit("error", { message: "Failed to mark notification as read" });
        }
    }
    emitTaskNotification(notification) {
        if (!this._io) {
            logger_1.default.error("Socket.IO server not initialized");
            return;
        }
        const room = `user_${notification.userId}`;
        this._io.to(room).emit("notification.new", notification);
        logger_1.default.info(`Emitted notification.new to user_${notification.userId}: ${notification._id} (${notification.type})`);
    }
};
exports.NotificationSocketHandler = NotificationSocketHandler;
exports.NotificationSocketHandler = NotificationSocketHandler = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("INotificationService")),
    __metadata("design:paramtypes", [Object])
], NotificationSocketHandler);
//# sourceMappingURL=notification-socket-handler.js.map