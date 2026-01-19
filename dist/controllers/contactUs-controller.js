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
exports.ContactMessageController = void 0;
const inversify_1 = require("inversify");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const base_controller_1 = require("../core/controller/base-controller");
const error_messages_1 = require("../constants/error-messages");
const messages_1 = require("../constants/messages");
let ContactMessageController = class ContactMessageController extends base_controller_1.BaseController {
    constructor(contactMessageService) {
        super();
        this.createContactMessage = async (req, res, next) => {
            try {
                const { name, email, message } = req.body;
                logger_1.default.debug(`Creating contact message from: ${email}`);
                if (!name || !email || !message) {
                    logger_1.default.error("Missing required fields: name, email, or message");
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_CONTACT_MESSAGE_FIELDS, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const contactMessage = await this._contactMessageService.createContactMessage({ name, email, message });
                this.sendCreated(res, { contactMessage }, messages_1.CONTACT_MESSAGE_MESSAGES.CONTACT_MESSAGE_CREATED);
                logger_1.default.info(`Contact message created by: ${email}`);
            }
            catch (error) {
                logger_1.default.error(`Error creating contact message: ${error.message}`);
                next(error);
            }
        };
        this.getAllContactMessages = async (req, res, next) => {
            try {
                logger_1.default.debug("Controller: Fetching contact messages");
                const { page = "1", limit = "10", search = "", dateFilter = "all", } = req.query;
                const result = await this._contactMessageService.getAllContactMessages({
                    page: Number(page),
                    limit: Number(limit),
                    search: String(search),
                    dateFilter: dateFilter,
                });
                this.sendSuccess(res, result, messages_1.CONTACT_MESSAGE_MESSAGES.CONTACT_MESSAGES_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error fetching contact messages: ${error.message}`);
                next(error);
            }
        };
        this.sendReply = async (req, res, next) => {
            try {
                const { contactMessageId } = req.params;
                const { email, replyMessage } = req.body;
                logger_1.default.debug(`Sending reply for contact message: ${contactMessageId}`);
                if (!email || !replyMessage) {
                    logger_1.default.error("Missing required fields: email or replyMessage");
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_EMAIL_REPLY_MESSAGE, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const updatedMessage = await this._contactMessageService.sendReply(contactMessageId, { email, replyMessage });
                this.sendSuccess(res, { updatedMessage }, messages_1.CONTACT_MESSAGE_MESSAGES.REPLY_SENT);
                logger_1.default.info(`Reply sent for contact message: ${contactMessageId}`);
            }
            catch (error) {
                logger_1.default.error(`Error sending reply: ${error.message}`);
                next(error);
            }
        };
        this._contactMessageService = contactMessageService;
    }
};
exports.ContactMessageController = ContactMessageController;
exports.ContactMessageController = ContactMessageController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IContactMessageService')),
    __metadata("design:paramtypes", [Object])
], ContactMessageController);
//# sourceMappingURL=contactUs-controller.js.map