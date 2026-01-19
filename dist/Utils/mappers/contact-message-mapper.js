"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toContactMessageDTO = toContactMessageDTO;
exports.toContactMessageDTOs = toContactMessageDTOs;
const logger_1 = __importDefault(require("../../core/utils/logger"));
function toContactMessageDTO(contactMessage) {
    if (!contactMessage) {
        logger_1.default.warn('Attempted to map null contact message to DTO');
        return null;
    }
    return {
        id: contactMessage._id.toString(),
        contactMessageId: contactMessage.contactMessageId,
        name: contactMessage.name,
        email: contactMessage.email,
        message: contactMessage.message,
        createdAt: contactMessage.createdAt,
        givenReply: contactMessage.givenReply,
    };
}
function toContactMessageDTOs(contactMessages) {
    return contactMessages
        .map(toContactMessageDTO)
        .filter((dto) => dto !== null);
}
//# sourceMappingURL=contact-message-mapper.js.map