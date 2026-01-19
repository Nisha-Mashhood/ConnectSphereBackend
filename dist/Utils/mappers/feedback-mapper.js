"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toFeedbackDTO = toFeedbackDTO;
exports.toFeedbackDTOs = toFeedbackDTOs;
const user_mapper_1 = require("./user-mapper");
const mentor_mapper_1 = require("./mentor-mapper");
const collaboration_mapper_1 = require("./collaboration-mapper");
const logger_1 = __importDefault(require("../../core/utils/logger"));
const mongoose_1 = require("mongoose");
function toFeedbackDTO(feedback) {
    if (!feedback) {
        logger_1.default.warn('Attempted to map null feedback to DTO');
        return null;
    }
    //userId (populated IUser or just an ID)
    let userId;
    let user;
    if (feedback.userId) {
        if (typeof feedback.userId === 'string') {
            userId = feedback.userId;
        }
        else if (feedback.userId instanceof mongoose_1.Types.ObjectId) {
            userId = feedback.userId.toString();
        }
        else {
            //IUser object (populated)
            userId = feedback.userId._id.toString();
            const userDTO = (0, user_mapper_1.toUserDTO)(feedback.userId);
            user = userDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Feedback ${feedback._id} has no userId`);
        userId = '';
    }
    //mentorId (populated IMentor or just an ID)
    let mentorId;
    let mentor;
    if (feedback.mentorId) {
        if (typeof feedback.mentorId === 'string') {
            mentorId = feedback.mentorId;
        }
        else if (feedback.mentorId instanceof mongoose_1.Types.ObjectId) {
            mentorId = feedback.mentorId.toString();
        }
        else {
            //IMentor object (populated)
            mentorId = feedback.mentorId._id.toString();
            const mentorDTO = (0, mentor_mapper_1.toMentorDTO)(feedback.mentorId);
            mentor = mentorDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Feedback ${feedback._id} has no mentorId`);
        mentorId = '';
    }
    //collaborationId (populated ICollaboration or just an ID)
    let collaborationId;
    let collaboration;
    if (feedback.collaborationId) {
        if (typeof feedback.collaborationId === 'string') {
            collaborationId = feedback.collaborationId;
        }
        else if (feedback.collaborationId instanceof mongoose_1.Types.ObjectId) {
            collaborationId = feedback.collaborationId.toString();
        }
        else {
            //ICollaboration object (populated)
            collaborationId = feedback.collaborationId._id.toString();
            const collaborationDTO = (0, collaboration_mapper_1.toCollaborationDTO)(feedback.collaborationId);
            collaboration = collaborationDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Feedback ${feedback._id} has no collaborationId`);
        collaborationId = '';
    }
    return {
        id: feedback._id.toString(),
        feedbackId: feedback.feedbackId,
        userId,
        user,
        mentorId,
        mentor,
        collaborationId,
        collaboration,
        givenBy: feedback.givenBy,
        rating: feedback.rating,
        communication: feedback.communication,
        expertise: feedback.expertise,
        punctuality: feedback.punctuality,
        comments: feedback.comments,
        wouldRecommend: feedback.wouldRecommend,
        isHidden: feedback.isHidden,
        createdAt: feedback.createdAt,
    };
}
function toFeedbackDTOs(feedbacks) {
    return feedbacks
        .map(toFeedbackDTO)
        .filter((dto) => dto !== null);
}
//# sourceMappingURL=feedback-mapper.js.map