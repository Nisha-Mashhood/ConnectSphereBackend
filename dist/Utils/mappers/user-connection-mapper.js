"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserConnectionDTO = toUserConnectionDTO;
exports.toUserConnectionDTOs = toUserConnectionDTOs;
const user_mapper_1 = require("./user-mapper");
const logger_1 = __importDefault(require("../../core/utils/logger"));
const mongoose_1 = require("mongoose");
function toUserConnectionDTO(connection) {
    if (!connection) {
        logger_1.default.warn('Attempted to map null user connection to DTO');
        return null;
    }
    //requester (populated IUser or just an ID)
    let requesterId;
    let requester;
    if (connection.requester) {
        if (typeof connection.requester === 'string') {
            requesterId = connection.requester;
        }
        else if (connection.requester instanceof mongoose_1.Types.ObjectId) {
            requesterId = connection.requester.toString();
        }
        else {
            // Assume it's an IUser object (populated)
            requesterId = connection.requester._id.toString();
            const requesterDTO = (0, user_mapper_1.toUserDTO)(connection.requester);
            requester = requesterDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`User connection ${connection._id} has no requester`);
        requesterId = '';
    }
    //recipient (populated IUser or just an ID)
    let recipientId;
    let recipient;
    if (connection.recipient) {
        if (typeof connection.recipient === 'string') {
            recipientId = connection.recipient;
        }
        else if (connection.recipient instanceof mongoose_1.Types.ObjectId) {
            recipientId = connection.recipient.toString();
        }
        else {
            //IUser object (populated)
            recipientId = connection.recipient._id.toString();
            const recipientDTO = (0, user_mapper_1.toUserDTO)(connection.recipient);
            recipient = recipientDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`User connection ${connection._id} has no recipient`);
        recipientId = '';
    }
    return {
        id: connection._id.toString(),
        connectionId: connection.connectionId,
        requesterId,
        requester,
        recipientId,
        recipient,
        requestStatus: connection.requestStatus,
        connectionStatus: connection.connectionStatus,
        requestSentAt: connection.requestSentAt,
        requestAcceptedAt: connection.requestAcceptedAt,
        disconnectedAt: connection.disconnectedAt,
        disconnectionReason: connection.disconnectionReason,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
    };
}
function toUserConnectionDTOs(connections) {
    return connections
        .map(toUserConnectionDTO)
        .filter((dto) => dto !== null);
}
//# sourceMappingURL=user-connection-mapper.js.map