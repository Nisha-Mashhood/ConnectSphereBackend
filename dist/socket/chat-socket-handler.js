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
exports.ChatSocketHandler = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../core/utils/logger"));
const group_model_1 = __importDefault(require("../Models/group-model"));
const user_connection_model_1 = __importDefault(require("../Models/user-connection-model"));
const inversify_1 = require("inversify");
let ChatSocketHandler = class ChatSocketHandler {
    constructor(contactsRepo, groupRepo, chatRepo, collaboartionRepository, notificationService) {
        this._activeChats = new Map();
        this._io = null;
        this._contactsRepo = contactsRepo;
        this._groupRepo = groupRepo;
        this._chatRepo = chatRepo;
        this._collabRepository = collaboartionRepository;
        this._notificationService = notificationService;
    }
    setIo(io) {
        this._io = io;
    }
    async handleJoinChats(socket, userId) {
        try {
            const contacts = await this._contactsRepo.findContactsByUserId(userId);
            const rooms = Array.from(new Set(contacts
                .map((contact) => {
                if (contact.type === "group" && contact.groupId) {
                    return `group_${contact.groupId._id.toString()}`;
                }
                else if (contact.userId && contact.targetUserId) {
                    const ids = [
                        contact.userId._id.toString(),
                        contact.targetUserId._id.toString(),
                    ].sort();
                    return `chat_${ids[0]}_${ids[1]}`;
                }
                return null;
            })
                .filter(Boolean)));
            socket.join(rooms);
            logger_1.default.info(`User ${userId} joined chats: ${rooms.join(", ")}`);
        }
        catch (error) {
            logger_1.default.error(`Error joining chats for user ${userId}: ${error.message}`);
            socket.emit("error", { message: "Failed to join chats" });
        }
    }
    handleJoinUserRoom(socket, userId) {
        socket.join(`user_${userId}`);
        const roomMembers = this._io?.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0;
        logger_1.default.info(`User ${userId} joined personal room: user_${userId}, socketId=${socket.id}, members=${roomMembers}`);
        this._io?.emit("userOnline", { userId });
        console.log(`[ONLINE] User ${userId} is online (broadcasted)`);
        socket.emit("userOnline", { userId });
    }
    handleEnsureUserRoom(socket, data) {
        const { userId } = data;
        socket.join(`user_${userId}`);
        const roomMembers = this._io?.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0;
        logger_1.default.info(`Ensured user ${userId} joined room user_${userId}, socketId=${socket.id}, members=${roomMembers}`);
        this._io?.to(`user_${userId}`).emit("userRoomJoined", { userId });
    }
    handleLeaveUserRoom(socket, userId) {
        socket.leave(`user_${userId}`);
        logger_1.default.info(`User ${userId} left personal room: user_${userId}, socketId=${socket.id}`);
    }
    handleActiveChat(data) {
        const { userId, chatKey } = data;
        this._activeChats.set(userId, chatKey);
        logger_1.default.info(`User ${userId} set active chat: ${chatKey}`);
    }
    async handleSendMessage(socket, message) {
        logger_1.default.info("RAW MESSAGE RECEIVED:", JSON.stringify(message, null, 2));
        logger_1.default.info("[DEBUG 1] handleSendMessage called");
        try {
            const { senderId, targetId, type, content, contentType = "text", collaborationId, userConnectionId, groupId, _id, } = message;
            if (!senderId || !targetId || !type || !content) {
                logger_1.default.error("Missing required fields in message");
                socket.emit("error", { message: "Missing required fields" });
                return;
            }
            const timestamp = new Date();
            let room = "";
            let savedMessage = null;
            const senderObjectId = new mongoose_1.default.Types.ObjectId(senderId);
            // ====================== SAVE MESSAGE ======================
            if (contentType === "text") {
                if (type === "group") {
                    const group = await this._groupRepo.getGroupById(targetId);
                    logger_1.default.info(`Group details : ${group}`);
                    if (!group) {
                        logger_1.default.error("Invalid group ID:", targetId);
                        socket.emit("error", { message: "Invalid group ID" });
                        return;
                    }
                    const isMember = await this._groupRepo.isUserInGroup(targetId, senderId);
                    logger_1.default.info(`isMember : ${isMember}`);
                    if (!isMember) {
                        logger_1.default.error("Sender not in group");
                        socket.emit("error", { message: "Not a group member" });
                        return;
                    }
                    room = `group_${targetId}`;
                    savedMessage = await this._chatRepo.saveChatMessage({
                        senderId: senderObjectId,
                        groupId: new mongoose_1.default.Types.ObjectId(groupId || targetId),
                        content,
                        contentType,
                        timestamp,
                        isRead: false,
                        status: "sent",
                    });
                }
                else {
                    // user-user or user-mentor
                    const contact = await this._contactsRepo.findContactByUsers(senderId, targetId);
                    if (!contact || !contact._id) {
                        logger_1.default.error("Contact not found for users:", senderId, targetId);
                        socket.emit("error", { message: "Invalid contact" });
                        return;
                    }
                    const ids = [
                        contact.userId.toString(),
                        contact.targetUserId?.toString(),
                    ].sort();
                    room = `chat_${ids[0]}_${ids[1]}`;
                    savedMessage = await this._chatRepo.saveChatMessage({
                        senderId: senderObjectId,
                        ...(type === "user-mentor" && {
                            collaborationId: new mongoose_1.default.Types.ObjectId(collaborationId || contact.collaborationId?.toString()),
                        }),
                        ...(type === "user-user" && {
                            userConnectionId: new mongoose_1.default.Types.ObjectId(userConnectionId || contact.userConnectionId?.toString()),
                        }),
                        content,
                        contentType,
                        timestamp,
                        isRead: false,
                        status: "sent",
                    });
                }
            }
            else {
                // Non-text (image, file, etc.) — assume already saved
                if (!_id) {
                    socket.emit("error", { message: "Non-text message requires _id" });
                    return;
                }
                savedMessage = await this._chatRepo.findChatMessageById(_id);
                if (!savedMessage) {
                    socket.emit("error", { message: "Message not found" });
                    return;
                }
                room =
                    type === "group"
                        ? `group_${targetId}`
                        : `chat_${[senderId, targetId].sort().join("_")}`;
                savedMessage.status = "sent";
                await savedMessage.save();
            }
            if (!savedMessage) {
                logger_1.default.error("Failed to save message");
                socket.emit("error", { message: "Failed to save message" });
                return;
            }
            logger_1.default.info(`[DEBUG 2] Message saved successfully, ${savedMessage}`);
            logger_1.default.info(`Message Id :",${savedMessage._id.toString()}`);
            logger_1.default.info(`collaboartionId : ${savedMessage.collaborationId?.toString() || null}`);
            logger_1.default.info(`userConnectionId : ${savedMessage.userConnectionId?.toString() || null}`);
            logger_1.default.info(`GroupId : ${savedMessage.groupId?.toString() || null}`);
            // ====================== BUILD messageData (common for both types) ======================
            const messageData = {
                senderId,
                targetId,
                type,
                content: savedMessage.content || content,
                contentType,
                thumbnailUrl: savedMessage.thumbnailUrl,
                fileMetadata: savedMessage.fileMetadata,
                ...(type === "group" && {
                    groupId: savedMessage.groupId?.toString() || targetId,
                }),
                ...(type === "user-mentor" && {
                    collaborationId: savedMessage.collaborationId?.toString(),
                }),
                ...(type === "user-user" && {
                    userConnectionId: savedMessage.userConnectionId?.toString(),
                }),
                timestamp: savedMessage.timestamp.toISOString(),
                _id: savedMessage._id.toString(),
                status: savedMessage.status,
                isRead: savedMessage.isRead || false,
            };
            // ====================== DETERMINE CHATKEY & RECIPIENTS ======================
            let chatKey = null;
            const recipientIds = [];
            if (type === "group" && savedMessage.groupId) {
                chatKey = `group_${savedMessage.groupId.toString()}`;
                const group = await group_model_1.default.findById(savedMessage.groupId);
                if (group) {
                    recipientIds.push(...group.members.filter((m) => m.userId.toString() !== senderId)
                        .map((m) => m.userId.toString()));
                }
            }
            else if (type === "user-mentor" && savedMessage.collaborationId) {
                chatKey = `user-mentor_${savedMessage.collaborationId.toString()}`;
                const collab = await this._collabRepository.findCollabById(savedMessage.collaborationId);
                if (collab) {
                    let mentorUserId = null;
                    if (typeof collab.mentorId === "object" && collab.mentorId !== null) {
                        const mentorObj = collab.mentorId;
                        if (typeof mentorObj.userId === "object" && mentorObj.userId !== null && "_id" in mentorObj.userId) {
                            mentorUserId = mentorObj.userId._id.toString();
                        }
                    }
                    if (!mentorUserId) {
                        mentorUserId = collab.mentorId?.toString() || null;
                    }
                    let userUserId = null;
                    if (typeof collab.userId === "object" && collab.userId !== null && "_id" in collab.userId) {
                        userUserId = collab.userId._id.toString();
                    }
                    else {
                        userUserId = collab.userId?.toString() || null;
                    }
                    const recipient = userUserId === senderId ? mentorUserId : userUserId;
                    if (recipient && recipient !== senderId) {
                        recipientIds.push(recipient);
                    }
                }
            }
            else if (type === "user-user" && savedMessage.userConnectionId) {
                chatKey = `user-user_${savedMessage.userConnectionId.toString()}`;
                const conn = await user_connection_model_1.default.findById(savedMessage.userConnectionId);
                if (conn) {
                    const recipient = conn.requester.toString() === senderId
                        ? conn.recipient.toString()
                        : conn.requester.toString();
                    if (recipient !== senderId)
                        recipientIds.push(recipient);
                }
            }
            if (!chatKey || recipientIds.length === 0) {
                logger_1.default.warn("No valid chatKey or recipients → skipping notifications");
            }
            else if (this._io) {
                logger_1.default.info("Starting notification + contactsUpdated for", recipientIds.length, "users");
                // === SEND NOTIFICATIONS ===
                for (const recipientId of recipientIds) {
                    try {
                        let relatedId = null;
                        if (type === "group") {
                            relatedId = savedMessage.groupId?.toString() || null;
                        }
                        else if (type === "user-mentor") {
                            relatedId = savedMessage.collaborationId?.toString() || null;
                        }
                        else if (type === "user-user") {
                            relatedId = savedMessage.userConnectionId?.toString() || null;
                        }
                        const notification = await this._notificationService.sendNotification(recipientId, "message", senderId, relatedId, type === "group" ? "group" : type === "user-mentor" ? "collaboration" : "userconnection");
                        // Auto-mark as read if recipient is actively viewing this chat
                        const activeChat = this._activeChats.get(recipientId);
                        if (activeChat === chatKey && notification.status === "unread") {
                            await this._notificationService.markNotificationAsRead(notification.id);
                            this._io
                                .to(`user_${recipientId}`)
                                .emit("notification.read", { notificationId: notification.id });
                        }
                    }
                    catch (err) {
                        logger_1.default.error(`[NOTIFY ERROR] Failed for ${recipientId}:`, err.message);
                    }
                }
                // === EMIT contactsUpdated TO REFRESH UNREAD COUNTS ===
                const allUsers = [...new Set([senderId, ...recipientIds])];
                for (const userId of allUsers) {
                    this._io.to(`user_${userId}`).emit("contactsUpdated");
                }
            }
            // ====================== BROADCAST MESSAGE ======================
            socket.broadcast.to(room).emit("receiveMessage", messageData);
            socket.emit("messageSaved", messageData);
        }
        catch (error) {
            logger_1.default.error("[FATAL] handleSendMessage crashed:", error.message, error.stack);
            socket.emit("error", { message: "Failed to send message" });
        }
    }
    handleTyping(socket, data) {
        const { userId, targetId, type, chatKey } = data;
        let room;
        if (type === "group") {
            room = `group_${targetId}`;
        }
        else {
            const ids = [userId, targetId].sort();
            room = `chat_${ids[0]}_${ids[1]}`;
        }
        socket.broadcast.to(room).emit("typing", { userId, chatKey });
        logger_1.default.info(`Broadcasting typing to room ${room}: userId=${userId}, chatKey=${chatKey}`);
    }
    handleStopTyping(socket, data) {
        const { userId, targetId, type, chatKey } = data;
        let room;
        if (type === "group") {
            room = `group_${targetId}`;
        }
        else {
            const ids = [userId, targetId].sort();
            room = `chat_${ids[0]}_${ids[1]}`;
        }
        socket.to(room).emit("stopTyping", { userId, chatKey });
        logger_1.default.info(`Broadcasting stopTyping to room ${room}: userId=${userId}, chatKey=${chatKey}`);
    }
    async handleMarkAsRead(socket, data) {
        try {
            const { chatKey, userId, type } = data;
            const updatedMessages = await this._chatRepo.markMessagesAsRead(chatKey, userId, type);
            const notifications = await this._notificationService.getNotifications(userId);
            const messageNotifications = notifications.filter((n) => n.type === "message" &&
                n.relatedId === chatKey &&
                n.status === "unread");
            for (const notification of messageNotifications) {
                const updatedNotification = await this._notificationService.markNotificationAsRead(notification.id.toString());
                if (updatedNotification && this._io) {
                    this._io
                        .to(`user_${userId}`)
                        .emit("notification.read", { notificationId: notification.id });
                }
            }
            let room;
            if (type === "group") {
                room = `group_${chatKey.replace("group_", "")}`;
            }
            else {
                const contact = await this._contactsRepo.findContactByUsers(userId, chatKey.replace(/^(user-mentor_|user-user_)/, ""));
                const ids = [
                    contact?.userId.toString(),
                    contact?.targetUserId?.toString(),
                ].sort();
                room = `chat_${ids[0]}_${ids[1]}`;
            }
            console.log(`[READ EMIT] Emitting messagesRead to room ${room}`, { chatKey, userId, messageIds: updatedMessages });
            this._io?.to(room).emit("messagesRead", { chatKey, userId, messageIds: updatedMessages });
            // NEW: Emit to personal rooms for 1-on-1 chats
            let otherUsers = [];
            if (type === "user-user") {
                const connId = chatKey.replace("user-user_", "");
                const conn = await user_connection_model_1.default.findById(connId);
                if (conn) {
                    const otherUser = conn.requester.toString() === userId ? conn.recipient.toString() : conn.requester.toString();
                    otherUsers.push(otherUser);
                }
            }
            else if (type === "user-mentor") {
                const collabId = chatKey.replace("user-mentor_", "");
                const collab = await this._collabRepository.findCollabById(collabId);
                if (collab) {
                    let mentorUserId = null;
                    if (typeof collab.mentorId === "object" && collab.mentorId !== null) {
                        const mentorObj = collab.mentorId;
                        if (mentorObj.userId) {
                            mentorUserId = typeof mentorObj.userId === "object"
                                ? mentorObj.userId._id.toString()
                                : mentorObj.userId;
                        }
                    }
                    else if (collab.mentorId) {
                        mentorUserId = collab.mentorId.toString();
                    }
                    let userUserId = null;
                    if (typeof collab.userId === "object" && collab.userId !== null) {
                        userUserId = collab.userId._id.toString();
                    }
                    else if (collab.userId) {
                        userUserId = collab.userId.toString();
                    }
                    if (mentorUserId && userUserId) {
                        const otherUser = userUserId === userId ? mentorUserId : userUserId;
                        if (otherUser && otherUser !== userId) {
                            otherUsers.push(otherUser);
                        }
                    }
                }
            }
            else if (type === "group") {
                const groupId = chatKey.replace("group_", "");
                const group = await this._groupRepo.getGroupById(groupId);
                if (group) {
                    otherUsers = group.members
                        .filter(m => m.userId.toString() !== userId)
                        .map(m => m.userId.toString());
                }
            }
            // Emit to all other users' personal rooms
            otherUsers.forEach(otherId => {
                console.log(`[READ EMIT] Emitting to personal room user_${otherId}`);
                this._io?.to(`user_${otherId}`).emit("messagesRead", { chatKey, userId, messageIds: updatedMessages });
            });
            logger_1.default.info(`Marked messages as read for user ${userId} in chat ${chatKey}`);
        }
        catch (error) {
            logger_1.default.error(`Error marking messages as read: ${error.message}`);
            socket.emit("error", { message: "Failed to mark messages as read" });
        }
    }
    handleLeaveChat(userId) {
        try {
            this._activeChats.delete(userId);
            logger_1.default.info(`User ${userId} left all chats — activeChat cleared`);
        }
        catch (err) {
            logger_1.default.error(`Failed to handle leaveChat for ${userId}: ${err.message}`);
        }
    }
};
exports.ChatSocketHandler = ChatSocketHandler;
exports.ChatSocketHandler = ChatSocketHandler = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IContactRepository")),
    __param(1, (0, inversify_1.inject)("IGroupRepository")),
    __param(2, (0, inversify_1.inject)("IChatRepository")),
    __param(3, (0, inversify_1.inject)("ICollaborationRepository")),
    __param(4, (0, inversify_1.inject)("INotificationService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ChatSocketHandler);
//# sourceMappingURL=chat-socket-handler.js.map