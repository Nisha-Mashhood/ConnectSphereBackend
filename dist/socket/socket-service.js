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
var SocketService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const events_1 = require("events");
const logger_1 = __importDefault(require("../core/utils/logger"));
const inversify_1 = require("inversify");
let SocketService = SocketService_1 = class SocketService {
    constructor(chatHandler, callHandler, notificationHandler) {
        this._io = null;
        this._chatHandler = chatHandler;
        this._callHandler = callHandler;
        // this._groupCallHandler = groupCallHandler;
        this._notificationHandler = notificationHandler;
    }
    initialize(io) {
        this._io = io;
        this._callHandler.setIo(io);
        // this._groupCallHandler.setIo(io); 
        this._notificationHandler.initializeSocket(io);
        this._chatHandler.setIo(io);
        logger_1.default.info("Socket.IO server initialized");
        SocketService_1.notificationEmitter.on("notification", (notification) => {
            this._notificationHandler.emitTaskNotification(notification);
        });
        this._io.on("connection", (socket) => {
            this.handleConnection(socket);
        });
    }
    handleConnection(socket) {
        logger_1.default.info(`New socket connection: ${socket.id}`);
        const userId = socket.handshake.auth.userId;
        socket.data.userId = userId;
        logger_1.default.info(`New client connected: socketId=${socket.id}, userId=${userId}, auth=${JSON.stringify(socket.handshake.auth)}`);
        socket.join(`user_${userId}`);
        logger_1.default.info(`User ${userId} joined personal room: user_${userId}, socketId=${socket.id}`);
        socket.on("chat:online", ({ userId }) => {
            socket.data.inChat = true;
            logger_1.default.info(`[PRESENCE] User ${userId} entered chat`);
            const rooms = Array.from(socket.rooms).filter((r) => r.startsWith("chat_") || r.startsWith("group_"));
            rooms.forEach((room) => {
                socket.to(room).emit("userOnline", { userId });
            });
        });
        socket.on("chat:offline", ({ userId }) => {
            socket.data.inChat = false;
            logger_1.default.info(`[PRESENCE] User ${userId} left chat`);
            const rooms = Array.from(socket.rooms).filter((r) => r.startsWith("chat_") || r.startsWith("group_"));
            rooms.forEach((room) => {
                socket.to(room).emit("userOffline", { userId });
            });
        });
        // Chat-related events
        socket.on("joinChats", (userId) => this._chatHandler.handleJoinChats(socket, userId));
        socket.on("joinUserRoom", (userId) => this._chatHandler.handleJoinUserRoom(socket, userId));
        socket.on("ensureUserRoom", (data) => this._chatHandler.handleEnsureUserRoom(socket, data));
        socket.on("leaveUserRoom", (userId) => this._chatHandler.handleLeaveUserRoom(socket, userId));
        socket.on("activeChat", (data) => this._chatHandler.handleActiveChat(data));
        socket.on("sendMessage", (message) => this._chatHandler.handleSendMessage(socket, message));
        socket.on("typing", (data) => this._chatHandler.handleTyping(socket, data));
        socket.on("stopTyping", (data) => this._chatHandler.handleStopTyping(socket, data));
        socket.on("markAsRead", (data) => this._chatHandler.handleMarkAsRead(socket, data));
        socket.on("leaveChat", (userId) => this._chatHandler.handleLeaveChat(userId));
        // One-on-one call events
        socket.on("offer", (data) => this._callHandler.handleOffer(socket, data));
        socket.on("answer", (data) => this._callHandler.handleAnswer(socket, data));
        socket.on("ice-candidate", (data) => this._callHandler.handleIceCandidate(socket, data));
        socket.on("callEnded", (data) => this._callHandler.handleCallEnded(socket, data));
        // Notification events
        socket.on("notification.read", (data) => this._notificationHandler.handleNotificationRead(socket, data));
        socket.on("disconnect", () => this.handleDisconnect(socket));
        socket.on("groupCallStarted", (data) => {
            logger_1.default.info(`Group call started by ${data.starterId} in group ${data.groupId}`);
            const room = `group_${data.groupId}`;
            socket.to(room).emit("groupCallStarted", {
                ...data,
                starterName: data.starterName || "Someone"
            });
            // socket.emit("groupCallStarted", data);
        });
        socket.on("groupCallJoined", (data) => {
            const room = `group_${data.groupId}`;
            socket.join(room);
            socket.to(room).emit("groupUserJoin", {
                userId: data.userId,
                groupId: data.groupId,
            });
            logger_1.default.info(`User ${data.userId} joined group call ${data.groupId}`);
        });
        socket.on("groupCallEnded", (data) => {
            logger_1.default.info(`Group call ended in group ${data.groupId}`);
            const room = `group_${data.groupId}`;
            this._io?.to(room).emit("groupCallEnded", data);
        });
    }
    handleDisconnect(socket) {
        const userId = socket.data.userId;
        if (socket.data.inChat) {
            const rooms = Array.from(socket.rooms).filter((r) => r.startsWith("chat_") || r.startsWith("group_"));
            rooms.forEach((room) => {
                socket.to(room).emit("userOffline", { userId });
            });
            logger_1.default.info(`[PRESENCE] User ${userId} went OFFLINE due to disconnect`);
        }
        logger_1.default.info(`User disconnected: socketId=${socket.id}, userId=${userId}`);
    }
};
exports.SocketService = SocketService;
SocketService.notificationEmitter = new events_1.EventEmitter();
exports.SocketService = SocketService = SocketService_1 = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IChatSocketHandler")),
    __param(1, (0, inversify_1.inject)("ICallSocketHandler")),
    __param(2, (0, inversify_1.inject)("INotificationSocketHandler")),
    __metadata("design:paramtypes", [Object, Object, Object])
], SocketService);
//# sourceMappingURL=socket-service.js.map