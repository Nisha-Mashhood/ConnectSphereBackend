"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCollaborationDTO = toCollaborationDTO;
exports.toCollaborationDTOs = toCollaborationDTOs;
const user_mapper_1 = require("./user-mapper");
const mentor_mapper_1 = require("./mentor-mapper");
const logger_1 = __importDefault(require("../../core/utils/logger"));
const mongoose_1 = require("mongoose");
function toSelectedSlotDTO(slot) {
    return {
        day: slot.day,
        timeSlots: slot.timeSlots,
    };
}
function toUnavailableDayDTO(day) {
    return {
        id: day._id.toString(),
        datesAndReasons: day.datesAndReasons,
        requestedBy: day.requestedBy,
        requesterId: day.requesterId.toString(),
        isApproved: day.isApproved,
        approvedById: day.approvedById.toString(),
    };
}
function toTemporarySlotChangeDTO(change) {
    return {
        id: change._id.toString(),
        datesAndNewSlots: change.datesAndNewSlots,
        requestedBy: change.requestedBy,
        requesterId: change.requesterId.toString(),
        isApproved: change.isApproved,
        approvedById: change.approvedById.toString(),
    };
}
function toCollaborationDTO(collaboration) {
    if (!collaboration) {
        logger_1.default.warn('Attempted to map null collaboration to DTO');
        return null;
    }
    //mentorId
    let mentorId;
    let mentor;
    if (collaboration.mentorId) {
        if (typeof collaboration.mentorId === 'string') {
            mentorId = collaboration.mentorId;
        }
        else if (collaboration.mentorId instanceof mongoose_1.Types.ObjectId) {
            mentorId = collaboration.mentorId.toString();
        }
        else {
            // IMentor object (populated)
            mentorId = collaboration.mentorId._id.toString();
            const mentorDTO = (0, mentor_mapper_1.toMentorDTO)(collaboration.mentorId);
            mentor = mentorDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Collaboration ${collaboration._id} has no mentorId`);
        mentorId = '';
    }
    // HuserId
    let userId;
    let user;
    if (collaboration.userId) {
        if (typeof collaboration.userId === 'string') {
            userId = collaboration.userId;
        }
        else if (collaboration.userId instanceof mongoose_1.Types.ObjectId) {
            userId = collaboration.userId.toString();
        }
        else {
            // IUser object (populated)
            userId = collaboration.userId._id.toString();
            const userDTO = (0, user_mapper_1.toUserDTO)(collaboration.userId);
            user = userDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Collaboration ${collaboration._id} has no userId`);
        userId = '';
    }
    return {
        id: collaboration._id.toString(),
        collaborationId: collaboration.collaborationId,
        mentorId,
        mentor,
        userId,
        user,
        selectedSlot: collaboration.selectedSlot.map(toSelectedSlotDTO),
        unavailableDays: collaboration.unavailableDays.map(toUnavailableDayDTO),
        temporarySlotChanges: collaboration.temporarySlotChanges.map(toTemporarySlotChangeDTO),
        price: collaboration.price,
        payment: collaboration.payment,
        paymentIntentId: collaboration.paymentIntentId,
        isCancelled: collaboration.isCancelled,
        isCompleted: collaboration.isCompleted,
        startDate: collaboration.startDate,
        endDate: collaboration.endDate,
        feedbackGiven: collaboration.feedbackGiven,
        createdAt: collaboration.createdAt,
    };
}
function toCollaborationDTOs(collaborations) {
    return collaborations
        .map(toCollaborationDTO)
        .filter((dto) => dto !== null);
}
//# sourceMappingURL=collaboration-mapper.js.map