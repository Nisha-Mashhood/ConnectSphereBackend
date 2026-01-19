"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toGroupRequestDTO = toGroupRequestDTO;
exports.toGroupRequestDTOs = toGroupRequestDTOs;
const group_mapper_1 = require("./group-mapper");
const user_mapper_1 = require("./user-mapper");
const logger_1 = __importDefault(require("../../core/utils/logger"));
const mongoose_1 = require("mongoose");
function toGroupRequestDTO(request) {
    if (!request) {
        logger_1.default.warn('Attempted to map null group request to DTO');
        return null;
    }
    // Handle groupId (populated IGroup or just an ID)
    let groupId;
    let group;
    if (request.groupId) {
        if (typeof request.groupId === 'string') {
            groupId = request.groupId;
        }
        else if (request.groupId instanceof mongoose_1.Types.ObjectId) {
            groupId = request.groupId.toString();
        }
        else {
            // Assume it's an IGroup object (populated)
            groupId = request.groupId._id.toString();
            const groupDTO = (0, group_mapper_1.toGroupDTO)(request.groupId);
            group = groupDTO ?? undefined; // Convert null to undefined
        }
    }
    else {
        logger_1.default.warn(`Group request ${request._id} has no groupId`);
        groupId = '';
    }
    // Handle userId (populated IUser or just an ID)
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
            // Assume it's an IUser object (populated)
            userId = request.userId._id.toString();
            const userDTO = (0, user_mapper_1.toUserDTO)(request.userId);
            user = userDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Group request ${request._id} has no userId`);
        userId = '';
    }
    return {
        id: request._id.toString(),
        groupRequestId: request.groupRequestId,
        groupId,
        group,
        userId,
        user,
        status: request.status,
        paymentStatus: request.paymentStatus,
        paymentId: request.paymentId,
        amountPaid: request.amountPaid,
        createdAt: request.createdAt,
    };
}
function toGroupRequestDTOs(requests) {
    return requests
        .map(toGroupRequestDTO)
        .filter((dto) => dto !== null);
}
//# sourceMappingURL=group-request-mapper.js.map