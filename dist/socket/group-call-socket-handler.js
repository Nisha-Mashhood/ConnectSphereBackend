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
exports.GroupCallSocketHandler = void 0;
const logger_1 = __importDefault(require("../core/utils/logger"));
const call_log_helper_1 = require("./Utils/call-log-helper");
const inversify_1 = require("inversify");
let GroupCallSocketHandler = class GroupCallSocketHandler {
    constructor(groupRepo, userRepo, notificationService, callLogRepo) {
        this._activeOffers = new Map();
        this._endedCalls = new Set();
        this._joinedUsersByCallId = new Map();
        this._io = null;
        this._groupToCallId = new Map();
        this._groupRepo = groupRepo;
        this._userRepo = userRepo;
        this._notificationService = notificationService;
        this._callLogRepo = callLogRepo;
    }
    setIo(io) {
        this._io = io;
    }
    getCallIdForGroup(groupId) {
        return this._groupToCallId.get(groupId);
    }
    async handleGroupOffer(socket, data) {
        try {
            const { groupId, senderId, recipientId, offer, callType, callId } = data;
            logger_1.default.info(`Received group ${callType} offer from ${senderId} to ${recipientId} for callId: ${callId}, groupId: ${groupId}`);
            const group = await this._groupRepo.getGroupById(groupId);
            if (!group) {
                logger_1.default.error(`Invalid group ID: ${groupId}`);
                socket.emit("error", { message: "Invalid group ID" });
                return;
            }
            const recipientIds = group.members
                .filter((member) => member.userId._id.toString() !== senderId)
                .map((member) => member.userId._id.toString());
            if (!recipientIds.includes(recipientId)) {
                logger_1.default.error(`Recipient ${recipientId} is not a member of group ${groupId}`);
                socket.emit("error", { message: "Invalid recipient for group call" });
                return;
            }
            const recipientSocketRoom = `user_${recipientId}`;
            const socketsInRoom = await this._io?.in(recipientSocketRoom).allSockets();
            if (!socketsInRoom || socketsInRoom.size === 0) {
                logger_1.default.warn(`No sockets found in room ${recipientSocketRoom} for recipient ${recipientId}`);
                return;
            }
            const sender = await this._userRepo.findById(senderId);
            logger_1.default.info(`Emitting groupOffer to ${recipientSocketRoom} for recipient ${recipientId}`);
            this._io?.to(recipientSocketRoom).emit("groupOffer", {
                groupId,
                senderId,
                recipientId,
                offer,
                callType,
                callId,
                senderName: sender?.name,
            });
        }
        catch (error) {
            logger_1.default.error(`Error broadcasting group offer: ${error.message}`);
            socket.emit("error", { message: "Failed to send group offer" });
        }
    }
    async handleGroupAnswer(socket, data) {
        try {
            const { groupId, senderId, recipientId, answer, callType, callId } = data;
            logger_1.default.info(`Received group ${callType} answer from ${senderId} to ${recipientId} for callId: ${callId}, groupId: ${groupId}`);
            const group = await this._groupRepo.getGroupById(groupId);
            if (!group) {
                logger_1.default.error(`Invalid group ID: ${groupId}`);
                socket.emit("error", { message: "Invalid group ID" });
                return;
            }
            const recipientSocketRoom = `user_${recipientId}`;
            const socketsInRoom = await this._io?.in(recipientSocketRoom).allSockets();
            if (!socketsInRoom || socketsInRoom.size === 0) {
                logger_1.default.warn(`No sockets found in room ${recipientSocketRoom} for recipient ${recipientId}`);
                return;
            }
            logger_1.default.info(`Emitting groupAnswer to ${recipientSocketRoom} for recipient ${recipientId}`);
            this._io?.to(recipientSocketRoom).emit("groupAnswer", {
                groupId,
                senderId,
                recipientId,
                answer,
                callType,
                callId,
            });
            const call = this._activeOffers.get(callId);
            if (call) {
                clearTimeout(call.endTimeout);
                this._activeOffers.delete(callId);
                logger_1.default.info(`Cleared active offer for callId: ${callId}`);
            }
        }
        catch (error) {
            logger_1.default.error(`Error broadcasting group answer: ${error.message}`);
            socket.emit("error", { message: "Failed to send group answer" });
        }
    }
    async handleGroupIceCandidate(socket, data) {
        try {
            const { groupId, senderId, recipientId, candidate, callType, callId } = data;
            logger_1.default.info(`Received group ${callType} ICE candidate from ${senderId} for callId: ${callId}, groupId: ${groupId}`);
            const group = await this._groupRepo.getGroupById(groupId);
            if (!group) {
                logger_1.default.error(`Invalid group ID: ${groupId}`);
                socket.emit("error", { message: "Invalid group ID" });
                return;
            }
            this._io?.to(`user_${recipientId}`).emit("groupIceCandidate", {
                groupId,
                senderId,
                recipientId,
                candidate,
                callType,
                callId,
            });
        }
        catch (error) {
            logger_1.default.error(`Error broadcasting group ICE candidate: ${error.message}`);
            socket.emit("error", { message: "Failed to send group ICE candidate" });
        }
    }
    async handleGroupCallEnded(socket, data) {
        try {
            const { groupId, senderId, callType, callId } = data;
            if (this._endedCalls.has(callId)) {
                logger_1.default.info(`Ignoring duplicate group callEnded for callId: ${callId}, groupId: ${groupId}`);
                return;
            }
            logger_1.default.info(`Received group callEnded from ${senderId} for callId: ${callId}, groupId: ${groupId}, callType: ${callType}`);
            const group = await this._groupRepo.getGroupById(groupId);
            if (!group) {
                logger_1.default.error(`Invalid group ID: ${groupId}`);
                socket.emit("error", { message: "Invalid group ID" });
                return;
            }
            const recipientIds = group.members
                .filter((member) => member.userId._id.toString() !== senderId)
                .map((member) => member.userId._id.toString());
            const room = `group_${groupId}`;
            // If senderId is leaving, emit userRoomLeft and update call log
            if (senderId && this._joinedUsersByCallId.has(callId)) {
                this._joinedUsersByCallId.get(callId).delete(senderId);
                logger_1.default.info(`Removed user ${senderId} from call ${callId}`);
                this._io?.to(room).emit("userRoomLeft", { userId: senderId });
                logger_1.default.info(`Emitted userRoomLeft for user ${senderId} to room ${room}`);
                // Update call log only if no users remain
                if (this._joinedUsersByCallId.get(callId).size === 0) {
                    await (0, call_log_helper_1.updateCallLog)(socket, this._io, this._callLogRepo, callId, senderId, recipientIds, {
                        status: "completed",
                        endTime: new Date(),
                    });
                }
            }
            else {
                // Entire call ending
                await (0, call_log_helper_1.updateCallLog)(socket, this._io, this._callLogRepo, callId, senderId, recipientIds, {
                    status: "completed",
                    endTime: new Date(),
                });
                this._io?.to(room).emit("groupCallEnded", {
                    groupId,
                    callId,
                });
            }
            this._endedCalls.add(callId);
            setTimeout(() => this._endedCalls.delete(callId), 60000);
            const call = this._activeOffers.get(callId);
            if (call) {
                clearTimeout(call.endTimeout);
                this._activeOffers.delete(callId);
            }
            // Clean up if no users remain
            if (this._joinedUsersByCallId.has(callId) &&
                this._joinedUsersByCallId.get(callId).size === 0) {
                this._joinedUsersByCallId.delete(callId);
                this._activeOffers.delete(callId);
                this._groupToCallId.delete(groupId);
                logger_1.default.info(`Cleaned up empty call ${callId} for group ${groupId}`);
            }
        }
        catch (error) {
            logger_1.default.error(`Error handling group callEnded: ${error.message}`);
            socket.emit("error", { message: "Failed to end group call" });
        }
    }
    async handleDisconnect(socket) {
        try {
            const userId = socket.data.userId;
            if (!userId) {
                logger_1.default.warn("Disconnect: No userId found in socket data");
                return;
            }
            logger_1.default.info(`User ${userId} disconnected from group calls`);
            const rooms = Array.from(socket.rooms).filter((room) => room.startsWith("group_"));
            for (const room of rooms) {
                const groupId = room.replace("group_", "");
                const callId = this.getCallIdForGroup(groupId);
                if (callId && this._joinedUsersByCallId.has(callId)) {
                    this._joinedUsersByCallId.get(callId).delete(userId);
                    logger_1.default.info(`Removed user ${userId} from call ${callId}`);
                    const group = await this._groupRepo.getGroupById(groupId);
                    if (!group) {
                        logger_1.default.error(`Invalid group ID: ${groupId}`);
                        continue;
                    }
                    const recipientIds = group.members
                        .filter((member) => member.userId._id.toString() !== userId)
                        .map((member) => member.userId._id.toString());
                    this._io?.to(room).emit("userRoomLeft", { userId });
                    logger_1.default.info(`Emitted userRoomLeft for user ${userId} to room ${room}`);
                    if (this._joinedUsersByCallId.get(callId).size === 0) {
                        await (0, call_log_helper_1.updateCallLog)(socket, this._io, this._callLogRepo, callId, userId, recipientIds, {
                            status: "completed",
                            endTime: new Date(),
                        });
                        this._joinedUsersByCallId.delete(callId);
                        this._activeOffers.delete(callId);
                        this._groupToCallId.delete(groupId);
                        logger_1.default.info(`Cleaned up empty call ${callId} for group ${groupId}`);
                    }
                }
            }
        }
        catch (error) {
            logger_1.default.error(`Error handling group call disconnect: ${error.message}`);
        }
    }
    async handleJoinGroupCall(socket, data) {
        try {
            const { groupId, userId, callType, callId } = data;
            logger_1.default.info(`User ${userId} joining group call for groupId: ${groupId}, callId: ${callId}, callType: ${callType}`);
            const group = await this._groupRepo.getGroupById(groupId);
            if (!group) {
                logger_1.default.error(`Invalid group ID: ${groupId}`);
                socket.emit("error", { message: "Invalid group ID" });
                return;
            }
            const isMember = group.members.some((member) => member.userId._id.toString() === userId);
            if (!isMember) {
                logger_1.default.error(`User ${userId} is not a member of group ${groupId}`);
                socket.emit("error", { message: "User is not a group member" });
                return;
            }
            const room = `group_${groupId}`;
            socket.join(room);
            logger_1.default.info(`User ${userId} joined group call room: ${room}`);
            if (!this._joinedUsersByCallId.has(callId)) {
                this._joinedUsersByCallId.set(callId, new Set());
            }
            this._joinedUsersByCallId.get(callId).add(userId);
            this._groupToCallId.set(groupId, callId);
            logger_1.default.info(`Mapped groupId ${groupId} to callId ${callId}`);
            const recipientIds = group.members
                .filter((member) => member.userId._id.toString() !== userId)
                .map((member) => member.userId._id.toString());
            // Create call log only when the first user joins
            if (this._joinedUsersByCallId.get(callId).size === 1) {
                const sender = await this._userRepo.findById(userId);
                await (0, call_log_helper_1.createCallLog)(socket, this._io, this._callLogRepo, {
                    CallId: callId,
                    chatKey: `group_${groupId}`,
                    callType,
                    type: "group",
                    senderId: userId,
                    recipientIds,
                    groupId,
                    callerName: sender?.name || "Unknown",
                });
            }
            const currentParticipants = Array.from(this._joinedUsersByCallId.get(callId) || []).filter((id) => id !== userId);
            socket.emit("joinedGroupCall", {
                groupId,
                callId,
                callType,
                participants: currentParticipants,
            });
            logger_1.default.info(`Sent participant list to ${userId}: ${currentParticipants}`);
            const unjoinedMembers = recipientIds.filter((memberId) => !this._joinedUsersByCallId.get(callId).has(memberId));
            const sender = await this._userRepo.findById(userId);
            for (const recipId of unjoinedMembers) {
                try {
                    const notification = await this._notificationService.sendNotification(recipId, "incoming_call", userId, `group_${groupId}`, "group", callId, callType, `Incoming group ${callType} call from ${sender?.name || "Group"}`);
                    this._io?.to(`user_${recipId}`).emit("notification.new", notification);
                    logger_1.default.info(`Sent group call notification to user ${recipId}: ${notification.id}`);
                }
                catch (error) {
                    logger_1.default.warn(`Failed to send group call notification to user ${recipId}: ${error.message}`);
                }
            }
            this._io?.to(room).emit("userRoomJoined", { userId });
            logger_1.default.info(`Emitted userRoomJoined for user ${userId} to ${room}`);
            const endTimeout = setTimeout(async () => {
                const call = this._activeOffers.get(callId);
                if (!call)
                    return;
                const socketsInRoom = await this._io?.in(room).allSockets();
                const connectedUserIds = new Set();
                if (socketsInRoom) {
                    for (const socketId of socketsInRoom) {
                        const s = this._io?.sockets.sockets.get(socketId);
                        if (s && s.data.userId) {
                            connectedUserIds.add(s.data.userId);
                        }
                    }
                }
                for (const recipId of recipientIds) {
                    if (!connectedUserIds.has(recipId)) {
                        const notification = await this._notificationService.updateCallNotificationToMissed(recipId, callId, `Missed group ${callType} call from ${sender?.name || "Group"}`);
                        if (notification) {
                            this._io
                                ?.to(`user_${recipId}`)
                                .emit("notification.updated", notification);
                            logger_1.default.info(`Emitted notification.updated to user_${recipId}: ${notification.id}`);
                        }
                        else {
                            const newNotification = await this._notificationService.sendNotification(recipId, "missed_call", userId, `group_${groupId}`, "group", callId, callType, `Missed group ${callType} call from ${sender?.name || "Group"}`);
                            this._io
                                ?.to(`user_${recipId}`)
                                .emit("notification.new", newNotification);
                            logger_1.default.info(`Emitted notification.new to user_${recipId}: ${newNotification.id}`);
                        }
                    }
                }
                // Update call log to missed for unjoined members
                if (unjoinedMembers.length > 0) {
                    await (0, call_log_helper_1.updateCallLog)(socket, this._io, this._callLogRepo, callId, userId, recipientIds, {
                        status: "missed",
                        endTime: new Date(),
                    });
                }
                this._activeOffers.delete(callId);
                this._joinedUsersByCallId.delete(callId);
                this._groupToCallId.delete(groupId);
                logger_1.default.info(`Cleaned up timed out call ${callId} for group ${groupId}`);
            }, 30000);
            this._activeOffers.set(callId, {
                senderId: userId,
                recipientIds,
                callType,
                callId,
                endTimeout,
            });
        }
        catch (error) {
            logger_1.default.error(`Error handling joinGroupCall: ${error.message}`);
            socket.emit("error", { message: "Failed to join group call" });
        }
    }
};
exports.GroupCallSocketHandler = GroupCallSocketHandler;
exports.GroupCallSocketHandler = GroupCallSocketHandler = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IGroupRepository")),
    __param(1, (0, inversify_1.inject)("IUserRepository")),
    __param(2, (0, inversify_1.inject)("INotificationService")),
    __param(3, (0, inversify_1.inject)("ICallLogRepository")),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], GroupCallSocketHandler);
//# sourceMappingURL=group-call-socket-handler.js.map