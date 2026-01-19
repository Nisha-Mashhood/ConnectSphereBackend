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
exports.ChatRepository = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const chat_model_1 = __importDefault(require("../Models/chat-model"));
const status_code_enums_1 = require("../enums/status-code-enums");
const error_messages_1 = require("../constants/error-messages");
let ChatRepository = class ChatRepository extends base_repositry_1.BaseRepository {
    constructor() {
        super(chat_model_1.default);
        this.saveChatMessage = async (data) => {
            try {
                logger_1.default.debug(`Saving chat message for sender: ${data.senderId}`);
                const message = await this.create({
                    ...data,
                    senderId: data.senderId ? this.toObjectId(data.senderId) : undefined,
                    collaborationId: data.collaborationId ? this.toObjectId(data.collaborationId) : undefined,
                    userConnectionId: data.userConnectionId ? this.toObjectId(data.userConnectionId) : undefined,
                    groupId: data.groupId ? this.toObjectId(data.groupId) : undefined,
                });
                logger_1.default.info(`Chat message created: ${message._id}`);
                return message;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error saving chat message`, err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_SAVE_CHAT_MESSAGE, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findChatMessageById = async (messageId) => {
            try {
                logger_1.default.debug(`Finding chat message by ID: ${messageId}`);
                const message = await this.findById(messageId);
                logger_1.default.info(`Chat message ${message ? 'found' : 'not found'}: ${messageId}`);
                return message;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error finding chat message by ID ${messageId}: ${err}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_FIND_CHAT_MESSAGE_BY_ID} ${messageId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findChatMessagesByCollaborationId = async (collaborationId, page, limit) => {
            try {
                logger_1.default.debug(`Finding messages for collaboration: ${collaborationId}`);
                const id = this.toObjectId(collaborationId);
                return await this.model
                    .find({ collaborationId: id })
                    .sort({ timestamp: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .exec();
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error finding messages by collaboration ID: ${err}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_FIND_CHAT_MESSAGES_BY_COLLABORATION_ID} ${collaborationId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findChatMessagesByUserConnectionId = async (userConnectionId, page, limit) => {
            try {
                logger_1.default.debug(`Finding messages for user connection: ${userConnectionId}`);
                const id = this.toObjectId(userConnectionId);
                return await this.model
                    .find({ userConnectionId: id })
                    .sort({ timestamp: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .exec();
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error finding messages by user connection ID: ${err}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_FIND_CHAT_MESSAGES_BY_USER_CONNECTION_ID} ${userConnectionId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findChatMessagesByGroupId = async (groupId, page, limit) => {
            try {
                logger_1.default.debug(`Finding messages for group: ${groupId}`);
                const id = this.toObjectId(groupId);
                return await this.model
                    .find({ groupId: id })
                    .sort({ timestamp: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .exec();
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error finding messages by group ID: ${err}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_FIND_CHAT_MESSAGES_BY_GROUP_ID} ${groupId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.countMessagesByCollaborationId = async (collaborationId) => {
            try {
                logger_1.default.debug(`Counting messages for collaboration: ${collaborationId}`);
                const id = this.toObjectId(collaborationId);
                return await this.model.countDocuments({ collaborationId: id });
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error counting messages by collaboration ID: ${err}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_COUNT_MESSAGES_BY_COLLABORATION_ID} ${collaborationId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.countMessagesByUserConnectionId = async (userConnectionId) => {
            try {
                logger_1.default.debug(`Counting messages for user connection: ${userConnectionId}`);
                const id = this.toObjectId(userConnectionId);
                return await this.model.countDocuments({ userConnectionId: id });
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error counting messages by user connection ID: ${err}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_COUNT_MESSAGES_BY_USER_CONNECTION_ID} ${userConnectionId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.countMessagesByGroupId = async (groupId) => {
            try {
                logger_1.default.debug(`Counting messages for group: ${groupId}`);
                const id = this.toObjectId(groupId);
                return await this.model.countDocuments({ groupId: id });
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error counting messages by group ID: ${err}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_COUNT_MESSAGES_BY_GROUP_ID} ${groupId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.countUnreadMessagesByGroupId = async (groupId, userId) => {
            try {
                logger_1.default.debug(`Counting unread messages for group: ${groupId}, user: ${userId}`);
                const gId = this.toObjectId(groupId);
                const uId = this.toObjectId(userId);
                const count = await this.model.countDocuments({
                    groupId: gId,
                    isRead: false,
                    senderId: { $ne: uId },
                });
                logger_1.default.debug(`Unread count for group ${groupId}: ${count}`);
                return count;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error counting unread messages by group ID: ${err}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_COUNT_UNREAD_MESSAGES_BY_GROUP_ID} ${groupId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.countUnreadMessagesByCollaborationId = async (collaborationId, userId) => {
            try {
                logger_1.default.debug(`Counting unread messages for collaboration: ${collaborationId}, user: ${userId}`);
                const cId = this.toObjectId(collaborationId);
                const uId = this.toObjectId(userId);
                const count = await this.model.countDocuments({
                    collaborationId: cId,
                    isRead: false,
                    senderId: { $ne: uId },
                });
                logger_1.default.debug(`Unread count for collaboration ${collaborationId}: ${count}`);
                return count;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error counting unread messages by collaboration ID: ${err}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_COUNT_UNREAD_MESSAGES_BY_COLLABORATION_ID} ${collaborationId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.countUnreadMessagesByUserConnectionId = async (userConnectionId, userId) => {
            try {
                logger_1.default.debug(`Counting unread messages for user connection: ${userConnectionId}, user: ${userId}`);
                const ucId = this.toObjectId(userConnectionId);
                const uId = this.toObjectId(userId);
                const count = await this.model.countDocuments({
                    userConnectionId: ucId,
                    isRead: false,
                    senderId: { $ne: uId },
                });
                logger_1.default.debug(`Unread count for user connection ${userConnectionId}: ${count}`);
                return count;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error counting unread messages by user connection ID: ${err}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_COUNT_UNREAD_MESSAGES_BY_USER_CONNECTION_ID} ${userConnectionId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.markMessagesAsRead = async (chatKey, userId, type) => {
            try {
                logger_1.default.debug(`Marking messages as read: ${chatKey}, user: ${userId}, type: ${type}`);
                const filter = {
                    isRead: false,
                    senderId: { $ne: this.toObjectId(userId) },
                };
                if (type === "group") {
                    filter.groupId = this.toObjectId(chatKey.replace("group_", ""));
                }
                else if (type === "user-mentor") {
                    filter.collaborationId = this.toObjectId(chatKey.replace("user-mentor_", ""));
                }
                else {
                    filter.userConnectionId = this.toObjectId(chatKey.replace("user-user_", ""));
                }
                const unreadMessages = await this.model.find(filter).select("_id").exec();
                const messageIds = unreadMessages.map((msg) => msg._id.toString());
                if (messageIds.length > 0) {
                    await this.model.updateMany({ _id: { $in: messageIds.map((id) => this.toObjectId(id)) } }, { $set: { isRead: true, status: "read" } });
                    logger_1.default.info(`Marked ${messageIds.length} messages as read for ${chatKey}`);
                }
                return messageIds;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error marking messages as read: ${err}`);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_MARK_MESSAGES_AS_READ, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
    }
    toObjectId(id) {
        if (!id) {
            logger_1.default.warn("Missing ID when converting to ObjectId");
            throw new error_handler_1.RepositoryError("Invalid ID: ID is required", status_code_enums_1.StatusCodes.BAD_REQUEST);
        }
        const idStr = id instanceof mongoose_1.Types.ObjectId ? id.toString() : id;
        if (!mongoose_1.Types.ObjectId.isValid(idStr)) {
            logger_1.default.warn(`Invalid ObjectId format: ${idStr}`);
            throw new error_handler_1.RepositoryError("Invalid ID: must be a 24 character hex string");
        }
        return new mongoose_1.Types.ObjectId(idStr);
    }
    async findLatestMessageByGroupId(groupId) {
        try {
            logger_1.default.debug(`Finding latest message for groupId: ${groupId}`);
            const message = await this.model
                .findOne({ groupId: this.toObjectId(groupId) })
                .sort({ timestamp: -1 })
                .select('timestamp content senderId contentType')
                .lean()
                .exec();
            return message;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger_1.default.error(`Error finding latest message by groupId ${groupId}: ${err}`);
            throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_FIND_LATEST_MESSAGE} by groupId ${groupId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
        }
    }
    async findLatestMessageByCollaborationId(collaborationId) {
        try {
            logger_1.default.debug(`Finding latest message for collaborationId: ${collaborationId}`);
            const message = await this.model
                .findOne({ collaborationId: this.toObjectId(collaborationId) })
                .sort({ timestamp: -1 })
                .select('timestamp content senderId contentType')
                .lean()
                .exec();
            return message;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger_1.default.error(`Error finding latest message by collaborationId ${collaborationId}: ${err}`);
            throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_FIND_LATEST_MESSAGE} by collaborationId ${collaborationId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
        }
    }
    async findLatestMessageByUserConnectionId(userConnectionId) {
        try {
            logger_1.default.debug(`Finding latest message for userConnectionId: ${userConnectionId}`);
            const message = await this.model
                .findOne({ userConnectionId: this.toObjectId(userConnectionId) })
                .sort({ timestamp: -1 })
                .select('timestamp content senderId contentType')
                .lean()
                .exec();
            return message;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger_1.default.error(`Error finding latest message by userConnectionId ${userConnectionId}: ${err}`);
            throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_FIND_LATEST_MESSAGE} by userConnectionId ${userConnectionId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
        }
    }
};
exports.ChatRepository = ChatRepository;
exports.ChatRepository = ChatRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], ChatRepository);
//# sourceMappingURL=chat-repository.js.map