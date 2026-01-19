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
exports.CallLogRepository = void 0;
const error_handler_1 = require("../core/utils/error-handler");
const base_repositry_1 = require("../core/repositries/base-repositry");
const logger_1 = __importDefault(require("../core/utils/logger"));
const call_model_1 = __importDefault(require("../Models/call-model"));
const status_code_enums_1 = require("../enums/status-code-enums");
const inversify_1 = require("inversify");
const error_messages_1 = require("../constants/error-messages");
let CallLogRepository = class CallLogRepository extends base_repositry_1.BaseRepository {
    constructor(userRepository) {
        super(call_model_1.default);
        this.createCallLog = async (data) => {
            try {
                logger_1.default.debug(`Creating call log for chatKey: ${data.chatKey}, senderId: ${data.senderId}, CallId: ${data.CallId}`);
                const callLog = await this.create(data);
                logger_1.default.info(`Created call log: ${callLog._id}, CallId: ${callLog.CallId}, status: ${callLog.status}`);
                return callLog;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating call log`, err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_CREATE_CALL_LOG, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateCallLog = async (CallId, data) => {
            try {
                logger_1.default.debug(`Updating call log for CallId: ${CallId}`);
                const callLog = await this.model
                    .findOneAndUpdate({ CallId }, { ...data, updatedAt: new Date() }, { new: true })
                    .exec();
                if (!callLog) {
                    logger_1.default.warn(`Call log not found for CallId: ${CallId}`);
                    throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.CALL_LOG_NOT_FOUND} for CallId: ${CallId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Updated call log: ${callLog._id}, CallId: ${callLog.CallId}, status: ${callLog.status}`);
                return callLog;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating call log for CallId: ${CallId}`, err);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_UPDATE_CALL_LOG} for CallId: ${CallId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findCallLogByCallId = async (CallId) => {
            try {
                logger_1.default.debug(`Finding call log by CallId: ${CallId}`);
                const callLog = await this.model.findOne({ CallId }).exec();
                if (callLog) {
                    logger_1.default.debug(`Found call log: ${callLog._id}, CallId: ${CallId}`);
                }
                else {
                    logger_1.default.debug(`No call log found for CallId: ${CallId}`);
                }
                return callLog;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error finding call log by CallId: ${CallId}`, err);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_FIND_CALL_LOG} by CallId: ${CallId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findCallLogsByUserId = async (userId) => {
            try {
                logger_1.default.debug(`Finding call logs for userId: ${userId}`);
                const callLogs = await this.model
                    .find({
                    $or: [{ senderId: userId }, { recipientIds: userId }],
                })
                    .sort({ createdAt: -1 })
                    .exec();
                const populatedCallLogs = await Promise.all(callLogs.map(async (log) => {
                    let senderDetails = null;
                    let recipientDetails = [];
                    try {
                        senderDetails = await this._userRepository.getUserById(log.senderId);
                    }
                    catch (error) {
                        logger_1.default.warn(`Failed to fetch sender details for userId ${log.senderId}: ${error}`);
                    }
                    try {
                        recipientDetails = await Promise.all(log.recipientIds.map(async (id) => {
                            try {
                                return await this._userRepository.getUserById(id);
                            }
                            catch (error) {
                                logger_1.default.warn(`Failed to fetch recipient details for userId ${id}: ${error}`);
                                return null;
                            }
                        }));
                    }
                    catch (error) {
                        logger_1.default.warn(`Error fetching recipient details: ${error}`);
                    }
                    return {
                        ...log.toObject(),
                        senderId: senderDetails
                            ? {
                                _id: senderDetails._id,
                                name: senderDetails.name,
                                profilePic: senderDetails.profilePic ?? null,
                            }
                            : { _id: log.senderId, name: "Unknown", profilePic: null },
                        recipientIds: recipientDetails.filter(Boolean).map((user) => ({
                            _id: user._id,
                            name: user.name,
                            profilePic: user.profilePic ?? null,
                        })),
                    };
                }));
                logger_1.default.info(`Retrieved ${populatedCallLogs.length} call logs for userId: ${userId}`);
                return populatedCallLogs;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error finding call logs for userId: ${userId}`, err);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_FETCH_CALL_LOGS} for userId: ${userId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._userRepository = userRepository;
    }
};
exports.CallLogRepository = CallLogRepository;
exports.CallLogRepository = CallLogRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object])
], CallLogRepository);
//# sourceMappingURL=call-repository.js.map