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
exports.ChatController = void 0;
const base_controller_1 = require("../core/controller/base-controller");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const inversify_1 = require("inversify");
const messages_1 = require("../constants/messages");
const error_messages_1 = require("../constants/error-messages");
let ChatController = class ChatController extends base_controller_1.BaseController {
    constructor(chatService) {
        super();
        this.getChatMessages = async (req, res, next) => {
            try {
                const { contactId, groupId, page = "1", limit = "10" } = req.query;
                const parsedPage = parseInt(page, 10);
                const parsedLimit = parseInt(limit, 10);
                if (isNaN(parsedPage) || parsedPage < 1) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.INVALID_PAGE_NUMBER, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (isNaN(parsedLimit) || parsedLimit < 1) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.INVALID_LIMIT_VALUE, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                logger_1.default.debug(`Fetching chat messages with contactId: ${contactId}, groupId: ${groupId}, page: ${parsedPage}, limit: ${parsedLimit}`);
                const result = await this._chatService.getChatMessages(contactId, groupId, parsedPage, parsedLimit);
                if (result.messages.length === 0) {
                    this.sendSuccess(res, { messages: [], total: 0, page: parsedPage, limit: parsedLimit }, contactId ? messages_1.CHAT_MESSAGES.NO_MESSAGES_FOUND_FOR_CONTACT : messages_1.CHAT_MESSAGES.NO_MESSAGES_FOUND_FOR_GROUP);
                    logger_1.default.info(`No messages found for contactId: ${contactId || "none"}, groupId: ${groupId || "none"}`);
                    return;
                }
                this.sendSuccess(res, { messages: result.messages, total: result.total, page: parsedPage, limit: parsedLimit }, messages_1.CHAT_MESSAGES.MESSAGES_RETRIEVED);
                logger_1.default.info(`Fetched ${result.messages.length} messages, total: ${result.total}`);
            }
            catch (error) {
                logger_1.default.error(`Error fetching chat messages: ${error.message}`);
                next(error);
            }
        };
        this.uploadAndSaveMessage = async (req, res, next) => {
            try {
                const { senderId, targetId, type, collaborationId, userConnectionId, groupId } = req.body;
                if (!req.file || !senderId || !targetId || !type) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_MESSAGE_FIELDS, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                logger_1.default.debug(`Uploading and saving message: senderId=${senderId}, targetId=${targetId}, type=${type}`);
                const result = await this._chatService.uploadAndSaveMessage({
                    senderId,
                    targetId,
                    type,
                    collaborationId,
                    userConnectionId,
                    groupId,
                    file: {
                        path: req.file.path,
                        size: req.file.size,
                        originalname: req.file.originalname,
                        mimetype: req.file.mimetype,
                    },
                });
                this.sendCreated(res, { url: result.url, thumbnailUrl: result.thumbnailUrl, messageId: result.messageId }, messages_1.CHAT_MESSAGES.MESSAGE_UPLOADED);
                logger_1.default.info(`Saved message: ${result.messageId}`);
            }
            catch (error) {
                if (error.http_code === status_code_enums_1.StatusCodes.BAD_REQUEST && error.message.includes("Video is too large")) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.VIDEO_TOO_LARGE, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                logger_1.default.error(`Error uploading and saving message: ${error.message}`);
                next(error);
            }
        };
        this.getUnreadMessageCounts = async (req, res, next) => {
            try {
                const { userId } = req.query;
                if (!userId) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const unreadCounts = await this._chatService.getUnreadMessageCounts(userId);
                if (Object.keys(unreadCounts).length === 0) {
                    this.sendSuccess(res, { unreadCounts: {} }, messages_1.CHAT_MESSAGES.NO_UNREAD_MESSAGES);
                    logger_1.default.info(`No unread messages found for userId: ${userId}`);
                    return;
                }
                logger_1.default.debug("Unread Counts: %s", JSON.stringify(unreadCounts, null, 2));
                this.sendSuccess(res, unreadCounts, messages_1.CHAT_MESSAGES.UNREAD_COUNTS_RETRIEVED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getLastMessageSummaries = async (req, res, next) => {
            try {
                const { userId } = req.query;
                if (!userId) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const summaries = await this._chatService.getLastMessageSummaries(userId);
                this.sendSuccess(res, summaries, messages_1.CHAT_MESSAGES.LAST_MESSAGE_SUMMARIES_RETRIEVED);
            }
            catch (error) {
                next(error);
            }
        };
        this._chatService = chatService;
    }
};
exports.ChatController = ChatController;
exports.ChatController = ChatController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IChatService')),
    __metadata("design:paramtypes", [Object])
], ChatController);
//# sourceMappingURL=chat-controller.js.map