"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCallLog = exports.createCallLog = void 0;
const logger_1 = __importDefault(require("../../core/utils/logger"));
const createCallLog = async (socket, io, callLogRepo, data) => {
    try {
        const callLogData = {
            CallId: data.CallId,
            chatKey: data.chatKey,
            callType: data.callType,
            type: data.type,
            senderId: data.senderId,
            recipientIds: data.recipientIds,
            groupId: data.groupId,
            status: "ongoing",
            callerName: data.callerName,
            startTime: new Date(),
        };
        const callLog = await callLogRepo.createCallLog(callLogData);
        logger_1.default.info(`Created call log: ${callLog._id}, CallId: ${callLog.CallId}, status: ${callLog.status}`);
        const allParticipants = [data.senderId, ...data.recipientIds];
        allParticipants.forEach((participantId) => {
            io?.to(`user_${participantId}`).emit("callLog.created", {
                ...callLog.toObject()
            });
            logger_1.default.info(`Emitted callLog.created to user_${participantId} for CallId: ${callLog.CallId}`);
        });
        return callLog;
    }
    catch (error) {
        logger_1.default.error(`Error creating call log for chatKey: ${data.chatKey}, CallId: ${data.CallId}: ${error.message}`);
        socket.emit("error", { message: "Failed to create call log" });
        return null;
    }
};
exports.createCallLog = createCallLog;
const updateCallLog = async (socket, io, callLogRepo, callId, senderId, recipientIds, updateData) => {
    try {
        const callLog = await callLogRepo.findCallLogByCallId(callId);
        if (!callLog) {
            logger_1.default.error(`Call log not found for CallId: ${callId}`);
            socket.emit("error", { message: "Call log not found" });
            return null;
        }
        const endTime = updateData.status === "completed" || updateData.status === "missed"
            ? updateData.endTime || new Date()
            : undefined;
        let duration;
        if (updateData.status === "completed" && callLog.startTime && endTime) {
            duration = Math.round((endTime.getTime() - callLog.startTime.getTime()) / 1000);
            logger_1.default.debug(`Calculated duration for CallId: ${callId}: ${duration} seconds`);
        }
        else if (updateData.status === "completed" && !callLog.startTime) {
            logger_1.default.warn(`Missing startTime for completed call, CallId: ${callId}`);
            duration = 0;
        }
        const updatedCallLog = await callLogRepo.updateCallLog(callId, {
            ...updateData,
            endTime,
            duration,
            updatedAt: new Date(),
        });
        if (updatedCallLog) {
            const allParticipants = [senderId, ...recipientIds];
            allParticipants.forEach((participantId) => {
                io?.to(`user_${participantId}`).emit("callLog.updated", {
                    ...updatedCallLog.toObject(),
                });
                logger_1.default.info(`Emitted callLog.updated to user_${participantId} for CallId: ${callId}, status: ${updatedCallLog.status}, duration: ${updatedCallLog.duration || 'N/A'}`);
            });
            return updatedCallLog;
        }
        logger_1.default.error(`Failed to update call log for CallId: ${callId}: No updated document returned`);
        socket.emit("error", { message: "Failed to update call log" });
        return null;
    }
    catch (error) {
        logger_1.default.error(`Error updating call log for CallId: ${callId}: ${error.message}`);
        socket.emit("error", { message: "Failed to update call log" });
        return null;
    }
};
exports.updateCallLog = updateCallLog;
//# sourceMappingURL=call-log-helper.js.map