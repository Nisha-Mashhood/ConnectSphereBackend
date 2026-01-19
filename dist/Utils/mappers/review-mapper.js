"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toReviewDTO = toReviewDTO;
exports.toReviewDTOs = toReviewDTOs;
const user_mapper_1 = require("./user-mapper");
const logger_1 = __importDefault(require("../../core/utils/logger"));
const mongoose_1 = require("mongoose");
function toReviewDTO(review) {
    if (!review) {
        logger_1.default.warn('Attempted to map null review to DTO');
        return null;
    }
    //userId (populated IUser or just an ID)
    let userId;
    let user;
    if (review.userId) {
        if (typeof review.userId === 'string') {
            userId = review.userId;
        }
        else if (review.userId instanceof mongoose_1.Types.ObjectId) {
            userId = review.userId.toString();
        }
        else {
            //IUser object (populated)
            userId = review.userId._id.toString();
            const userDTO = (0, user_mapper_1.toUserDTO)(review.userId);
            user = userDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Review ${review._id} has no userId`);
        userId = '';
    }
    return {
        id: review._id.toString(),
        reviewId: review.reviewId,
        userId,
        user,
        rating: review.rating,
        comment: review.comment,
        isApproved: review.isApproved,
        isSelect: review.isSelect,
        createdAt: review.createdAt,
    };
}
function toReviewDTOs(reviews) {
    return reviews
        .map(toReviewDTO)
        .filter((dto) => dto !== null);
}
//# sourceMappingURL=review-mapper.js.map