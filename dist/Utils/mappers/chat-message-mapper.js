"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toChatMessageDTO = toChatMessageDTO;
exports.toChatMessageDTOs = toChatMessageDTOs;
const user_mapper_1 = require("./user-mapper");
const collaboration_mapper_1 = require("./collaboration-mapper");
const user_connection_mapper_1 = require("./user-connection-mapper");
const group_mapper_1 = require("./group-mapper");
const logger_1 = __importDefault(require("../../core/utils/logger"));
const mongoose_1 = require("mongoose");
function toChatMessageDTO(chatMessage) {
    if (!chatMessage) {
        logger_1.default.warn('Attempted to map null chat message to DTO');
        return null;
    }
    //senderId (populated IUser or just an ID)
    let senderId;
    let sender;
    if (chatMessage.senderId) {
        if (typeof chatMessage.senderId === 'string') {
            senderId = chatMessage.senderId;
        }
        else if (chatMessage.senderId instanceof mongoose_1.Types.ObjectId) {
            senderId = chatMessage.senderId.toString();
        }
        else {
            //IUser object (populated)
            senderId = chatMessage.senderId._id.toString();
            const userDTO = (0, user_mapper_1.toUserDTO)(chatMessage.senderId);
            sender = userDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Chat message ${chatMessage._id} has no senderId`);
        senderId = '';
    }
    //collaborationId (populated ICollaboration or just an ID)
    let collaborationId;
    let collaboration;
    if (chatMessage.collaborationId) {
        if (typeof chatMessage.collaborationId === 'string') {
            collaborationId = chatMessage.collaborationId;
        }
        else if (chatMessage.collaborationId instanceof mongoose_1.Types.ObjectId) {
            collaborationId = chatMessage.collaborationId.toString();
        }
        else {
            //ICollaboration object (populated)
            collaborationId = chatMessage.collaborationId._id.toString();
            const collaborationDTO = (0, collaboration_mapper_1.toCollaborationDTO)(chatMessage.collaborationId);
            collaboration = collaborationDTO ?? undefined;
        }
    }
    //userConnectionId (populated IUserConnection or just an ID)
    let userConnectionId;
    let userConnection;
    if (chatMessage.userConnectionId) {
        if (typeof chatMessage.userConnectionId === 'string') {
            userConnectionId = chatMessage.userConnectionId;
        }
        else if (chatMessage.userConnectionId instanceof mongoose_1.Types.ObjectId) {
            userConnectionId = chatMessage.userConnectionId.toString();
        }
        else {
            //IUserConnection object (populated)
            userConnectionId = chatMessage.userConnectionId._id.toString();
            const userConnectionDTO = (0, user_connection_mapper_1.toUserConnectionDTO)(chatMessage.userConnectionId);
            userConnection = userConnectionDTO ?? undefined;
        }
    }
    //groupId (populated IGroup or just an ID)
    let groupId;
    let group;
    if (chatMessage.groupId) {
        if (typeof chatMessage.groupId === 'string') {
            groupId = chatMessage.groupId;
        }
        else if (chatMessage.groupId instanceof mongoose_1.Types.ObjectId) {
            groupId = chatMessage.groupId.toString();
        }
        else {
            //IGroup object (populated)
            groupId = chatMessage.groupId._id.toString();
            const groupDTO = (0, group_mapper_1.toGroupDTO)(chatMessage.groupId);
            group = groupDTO ?? undefined;
        }
    }
    return {
        id: chatMessage._id.toString(),
        ChatId: chatMessage.ChatId,
        senderId,
        sender,
        content: chatMessage.content,
        thumbnailUrl: chatMessage.thumbnailUrl,
        collaborationId,
        collaboration,
        userConnectionId,
        userConnection,
        groupId,
        group,
        contentType: chatMessage.contentType,
        fileMetadata: chatMessage.fileMetadata,
        isRead: chatMessage.isRead,
        status: chatMessage.status,
        timestamp: chatMessage.timestamp,
    };
}
function toChatMessageDTOs(chatMessages) {
    return chatMessages
        .map(toChatMessageDTO)
        .filter((dto) => dto !== null);
}
//# sourceMappingURL=chat-message-mapper.js.map