"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMentorRequestDTO = toMentorRequestDTO;
exports.toMentorRequestDTOs = toMentorRequestDTOs;
const user_mapper_1 = require("./user-mapper");
const mentor_mapper_1 = require("./mentor-mapper");
const logger_1 = __importDefault(require("../../core/utils/logger"));
const mongoose_1 = require("mongoose");
function toMentorRequestDTO(request) {
    if (!request) {
        logger_1.default.warn('Attempted to map null mentor request to DTO');
        return null;
    }
    // Handle mentorId
    let mentorId;
    let mentor;
    if (request.mentorId) {
        if (typeof request.mentorId === 'string') {
            mentorId = request.mentorId;
        }
        else if (request.mentorId instanceof mongoose_1.Types.ObjectId) {
            mentorId = request.mentorId.toString();
        }
        else {
            // IMentor object (populated)
            mentorId = request.mentorId._id.toString();
            const mentorDTO = (0, mentor_mapper_1.toMentorDTO)(request.mentorId);
            mentor = mentorDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Mentor request ${request._id} has no mentorId`);
        mentorId = '';
    }
    // Handle userId
    let userId;
    let user;
    if (request.userId) {
        if (typeof request.userId === 'string') {
            userId = request.userId;
        }
        else if (request.userId instanceof mongoose_1.Types.ObjectId) {
            userId = request.userId.toString();
        }
        else {
            // IUser object (populated)
            userId = request.userId._id.toString();
            const userDTO = (0, user_mapper_1.toUserDTO)(request.userId);
            user = userDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Mentor request ${request._id} has no userId`);
        userId = '';
    }
    return {
        id: request._id.toString(),
        mentorRequestId: request.mentorRequestId,
        mentorId,
        mentor,
        userId,
        user,
        selectedSlot: request.selectedSlot
            ? {
                day: request.selectedSlot.day,
                timeSlots: request.selectedSlot.timeSlots,
            }
            : undefined,
        price: request.price,
        paymentStatus: request.paymentStatus,
        timePeriod: request.timePeriod,
        isAccepted: request.isAccepted,
        createdAt: request.createdAt,
    };
}
function toMentorRequestDTOs(requests) {
    return requests
        .map(toMentorRequestDTO)
        .filter((dto) => dto !== null);
}
//# sourceMappingURL=mentor-request-mapper.js.map