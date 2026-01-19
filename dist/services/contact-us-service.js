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
exports.ContactMessageService = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const env_config_1 = __importDefault(require("../config/env-config"));
const status_code_enums_1 = require("../enums/status-code-enums");
const email_1 = require("../core/utils/email");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const contact_message_mapper_1 = require("../Utils/mappers/contact-message-mapper");
let ContactMessageService = class ContactMessageService {
    constructor(contactMessageRepository) {
        this.createContactMessage = async (data) => {
            try {
                logger_1.default.debug(`Creating contact message from: ${data.email}`);
                if (!data.name || !data.email || !data.message) {
                    logger_1.default.error("Missing required fields: name, email, or message");
                    throw new error_handler_1.ServiceError("Name, email, and message are required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const ReceiverEmail = env_config_1.default.adminEmail;
                if (!ReceiverEmail) {
                    logger_1.default.error("Receiver email not configured");
                    throw new error_handler_1.ServiceError("Receiver email required", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                const contactMessage = await this.contactMessageRepo.createContactMessage(data);
                const contactMessageDTO = (0, contact_message_mapper_1.toContactMessageDTO)(contactMessage);
                if (!contactMessageDTO) {
                    logger_1.default.error(`Failed to map contact message ${contactMessage._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map contact message to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                const emailText = `New Contact Message\n\nName: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}\n\nSent at: ${new Date().toLocaleString()}`;
                await (0, email_1.sendEmail)(ReceiverEmail, "New Contact Message from ConnectSphere", emailText);
                logger_1.default.info(`Email sent to admin: ${ReceiverEmail}`);
                logger_1.default.info(`Contact message created: ${contactMessage._id}`);
                return contactMessageDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error processing contact message from ${data.email}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to process contact message", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllContactMessages = async ({ page = 1, limit = 10, search = "", dateFilter = "all", }) => {
            try {
                logger_1.default.debug(`Service: Fetching contact messages with pagination/search/filter`);
                const { messages, total, page: currentPage, pages } = await this.contactMessageRepo.getAllContactMessages({
                    page,
                    limit,
                    search,
                    dateFilter,
                });
                const messagesDTO = (0, contact_message_mapper_1.toContactMessageDTOs)(messages);
                return {
                    messages: messagesDTO,
                    total,
                    page: currentPage,
                    pages,
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching contact messages: ${err.message}`);
                throw new error_handler_1.ServiceError("Failed to fetch contact messages", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.sendReply = async (contactMessageId, replyData) => {
            try {
                logger_1.default.debug(`Sending reply for contact message: ${contactMessageId}`);
                if (!mongoose_1.Types.ObjectId.isValid(contactMessageId)) {
                    logger_1.default.error("Invalid contact message ID");
                    throw new error_handler_1.ServiceError("Invalid contact message ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (!replyData.email || !replyData.replyMessage) {
                    logger_1.default.error("Missing required fields: email or reply message");
                    throw new error_handler_1.ServiceError("Email and reply message are required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const updatedMessage = await this.contactMessageRepo.updateReplyStatus(contactMessageId);
                if (!updatedMessage) {
                    logger_1.default.error(`Contact message not found: ${contactMessageId}`);
                    throw new error_handler_1.ServiceError("Contact message not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const updatedMessageDTO = (0, contact_message_mapper_1.toContactMessageDTO)(updatedMessage);
                if (!updatedMessageDTO) {
                    logger_1.default.error(`Failed to map contact message ${updatedMessage._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map contact message to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                await (0, email_1.sendEmail)(replyData.email, "Reply from ConnectSphere", `Hello ${updatedMessage.name},\n\n${replyData.replyMessage}\n\nBest regards,\nConnectSphere Team`);
                logger_1.default.info(`Reply email sent to: ${replyData.email}`);
                logger_1.default.info(`Reply sent for contact message: ${contactMessageId}`);
                return updatedMessageDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error sending reply for contact message ${contactMessageId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to send reply", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.contactMessageRepo = contactMessageRepository;
    }
};
exports.ContactMessageService = ContactMessageService;
exports.ContactMessageService = ContactMessageService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IContactMessageRepository')),
    __metadata("design:paramtypes", [Object])
], ContactMessageService);
//# sourceMappingURL=contact-us-service.js.map