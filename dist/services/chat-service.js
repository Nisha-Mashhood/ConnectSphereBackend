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
exports.ChatService = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const logger_1 = __importDefault(require("../core/utils/logger"));
const status_code_enums_1 = require("../enums/status-code-enums");
const error_handler_1 = require("../core/utils/error-handler");
const cloudinary_1 = require("../core/utils/cloudinary");
const chat_message_mapper_1 = require("../Utils/mappers/chat-message-mapper");
let ChatService = class ChatService {
    constructor(chatRepository, contactRepository, groupRepository) {
        this.getChatMessages = async (contactId, groupId, page = 1, limit = 10) => {
            try {
                logger_1.default.debug(`Fetching chat messages for contact: ${contactId}, group: ${groupId}, page: ${page}, limit: ${limit}`);
                if (!contactId && !groupId) {
                    throw new error_handler_1.ServiceError("Contact ID or Group ID is required to fetch chat messages", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (contactId && groupId) {
                    throw new error_handler_1.ServiceError("Provide only one of Contact ID or Group ID, not both", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                let messages = [];
                let total = 0;
                if (groupId) {
                    if (!mongoose_1.Types.ObjectId.isValid(groupId)) {
                        throw new error_handler_1.ServiceError("Invalid group ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                    }
                    const group = await this._groupRepository.getGroupById(groupId);
                    if (!group) {
                        throw new error_handler_1.ServiceError("Invalid group ID", status_code_enums_1.StatusCodes.NOT_FOUND);
                    }
                    messages = await this._chatRepository.findChatMessagesByGroupId(groupId, page, limit);
                    total = await this._chatRepository.countMessagesByGroupId(groupId);
                }
                else if (contactId) {
                    if (!mongoose_1.Types.ObjectId.isValid(contactId)) {
                        throw new error_handler_1.ServiceError("Invalid contact ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                    }
                    const contact = await this._contactRepository.findContactById(contactId);
                    if (!contact) {
                        throw new error_handler_1.ServiceError("Invalid contact ID", status_code_enums_1.StatusCodes.NOT_FOUND);
                    }
                    if (contact.type === "user-mentor" && contact.collaborationId) {
                        messages = await this._chatRepository.findChatMessagesByCollaborationId(contact.collaborationId.toString(), page, limit);
                        total = await this._chatRepository.countMessagesByCollaborationId(contact.collaborationId.toString());
                    }
                    else if (contact.type === "user-user" && contact.userConnectionId) {
                        messages = await this._chatRepository.findChatMessagesByUserConnectionId(contact.userConnectionId.toString(), page, limit);
                        total = await this._chatRepository.countMessagesByUserConnectionId(contact.userConnectionId.toString());
                    }
                    else {
                        throw new error_handler_1.ServiceError("No valid connection ID found for contact", status_code_enums_1.StatusCodes.BAD_REQUEST);
                    }
                }
                const messagesDTO = (0, chat_message_mapper_1.toChatMessageDTOs)(messages);
                return { messages: messagesDTO.reverse(), total };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching chat messages: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch chat messages", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getUnreadMessageCounts = async (userId) => {
            try {
                logger_1.default.debug(`Fetching unread message counts for user: ${userId}`);
                if (!userId) {
                    throw new error_handler_1.ServiceError("User ID is required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                    throw new error_handler_1.ServiceError("Invalid user ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const contacts = await this._contactRepository.findContactsByUserId(userId);
                logger_1.default.debug(`Found ${contacts.length} contacts for user: ${userId}`);
                const unreadCounts = {};
                if (contacts.length === 0) {
                    logger_1.default.info(`No contacts found for user: ${userId}`);
                    return unreadCounts;
                }
                for (const contact of contacts) {
                    let count = 0;
                    try {
                        if (contact.type === "group" && contact.groupId) {
                            const groupIdStr = contact.groupId._id?.toString();
                            if (!groupIdStr)
                                continue;
                            count = await this._chatRepository.countUnreadMessagesByGroupId(groupIdStr, userId);
                            unreadCounts[`group_${groupIdStr}`] = count;
                        }
                        else if (contact.type === "user-mentor" &&
                            contact.collaborationId) {
                            const collabIdStr = contact.collaborationId._id?.toString();
                            if (!collabIdStr)
                                continue;
                            count = await this._chatRepository.countUnreadMessagesByCollaborationId(collabIdStr, userId);
                            unreadCounts[`user-mentor_${collabIdStr}`] = count;
                        }
                        else if (contact.type === "user-user" && contact.userConnectionId) {
                            const userConnIdStr = contact.userConnectionId._id?.toString();
                            if (!userConnIdStr)
                                continue;
                            count = await this._chatRepository.countUnreadMessagesByUserConnectionId(userConnIdStr, userId);
                            unreadCounts[`user-user_${userConnIdStr}`] = count;
                        }
                    }
                    catch (error) {
                        const err = error instanceof Error ? error : new Error(String(error));
                        logger_1.default.warn(`Skipping unread count for contact ${contact._id}: ${err.message}`);
                        const id = contact.groupId?._id?.toString() ||
                            contact.collaborationId?._id?.toString() ||
                            contact.userConnectionId?._id?.toString() ||
                            "unknown";
                        unreadCounts[`${contact.type}_${id}`] = 0;
                    }
                }
                logger_1.default.info(`Unread message counts: ${JSON.stringify(unreadCounts)}`);
                return unreadCounts;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching unread message counts for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch unread message counts", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.uploadAndSaveMessage = async (data) => {
            try {
                logger_1.default.debug(`Uploading and saving message: senderId=${data.senderId}, targetId=${data.targetId}, type=${data.type}`);
                // Validate message type and associated IDs
                if (data.type === 'user-mentor' && !data.collaborationId) {
                    throw new error_handler_1.ServiceError('Collaboration ID is required for user-mentor messages', status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (data.type === 'user-user' && !data.userConnectionId) {
                    throw new error_handler_1.ServiceError('User connection ID is required for user-user messages', status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (data.type === 'group' && !data.groupId) {
                    throw new error_handler_1.ServiceError('Group ID is required for group messages', status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                // Ensure only the relevant ID is included
                if (data.type !== 'user-mentor' && data.collaborationId) {
                    throw new error_handler_1.ServiceError('Collaboration ID is only valid for user-mentor messages', status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (data.type !== 'user-user' && data.userConnectionId) {
                    throw new error_handler_1.ServiceError('User connection ID is only valid for user-user messages', status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (data.type !== 'group' && data.groupId) {
                    throw new error_handler_1.ServiceError('Group ID is only valid for group messages', status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const folder = data.type === 'group' ? 'group_chat_media' : 'chat_media';
                const contentType = data.file.mimetype?.startsWith('image/')
                    ? 'image'
                    : data.file.mimetype?.startsWith('video/')
                        ? 'video'
                        : 'file';
                const { url, thumbnailUrl } = await (0, cloudinary_1.uploadMedia)(data.file.path, folder, data.file.size, contentType);
                const message = await this._chatRepository.saveChatMessage({
                    senderId: data.senderId,
                    content: url,
                    thumbnailUrl,
                    contentType,
                    collaborationId: data.collaborationId,
                    userConnectionId: data.userConnectionId,
                    groupId: data.groupId,
                    fileMetadata: {
                        fileName: data.file.originalname,
                        fileSize: data.file.size,
                        mimeType: data.file.mimetype,
                    },
                    timestamp: new Date(),
                });
                logger_1.default.info(`Saved message: ${message._id}`);
                return { url, thumbnailUrl, messageId: message._id.toString() };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error uploading and saving message: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to upload and save message", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getLastMessageSummaries = async (userId) => {
            try {
                logger_1.default.debug(`Fetching last message summaries for user: ${userId}`);
                if (!userId) {
                    throw new error_handler_1.ServiceError("User ID is required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                    throw new error_handler_1.ServiceError("Invalid user ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const contacts = await this._contactRepository.findContactsByUserId(userId);
                const summaries = {};
                for (const contact of contacts) {
                    try {
                        if (contact.type === "group" && contact.groupId?._id) {
                            const groupId = contact.groupId._id.toString();
                            const msg = await this._chatRepository.findLatestMessageByGroupId(groupId);
                            if (msg) {
                                summaries[`group_${groupId}`] = {
                                    content: msg.content,
                                    senderId: msg.senderId.toString(),
                                    timestamp: msg.timestamp,
                                    contentType: msg.contentType,
                                };
                            }
                        }
                        else if (contact.type === "user-mentor" &&
                            contact.collaborationId?._id) {
                            const collabId = contact.collaborationId._id.toString();
                            const msg = await this._chatRepository.findLatestMessageByCollaborationId(collabId);
                            if (msg) {
                                summaries[`user-mentor_${collabId}`] = {
                                    content: msg.content,
                                    senderId: msg.senderId.toString(),
                                    timestamp: msg.timestamp,
                                    contentType: msg.contentType,
                                };
                            }
                        }
                        else if (contact.type === "user-user" &&
                            contact.userConnectionId?._id) {
                            const connId = contact.userConnectionId._id.toString();
                            const msg = await this._chatRepository.findLatestMessageByUserConnectionId(connId);
                            if (msg) {
                                summaries[`user-user_${connId}`] = {
                                    content: msg.content,
                                    senderId: msg.senderId.toString(),
                                    timestamp: msg.timestamp,
                                    contentType: msg.contentType,
                                };
                            }
                        }
                    }
                    catch (err) {
                        logger_1.default.warn(`Skipping last message summary for contact ${contact._id}: ${err.message}`);
                    }
                }
                return summaries;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching last message summaries for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch last message summaries", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._chatRepository = chatRepository;
        this._contactRepository = contactRepository;
        this._groupRepository = groupRepository;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IChatRepository')),
    __param(1, (0, inversify_1.inject)('IContactRepository')),
    __param(2, (0, inversify_1.inject)('IGroupRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], ChatService);
//# sourceMappingURL=chat-service.js.map