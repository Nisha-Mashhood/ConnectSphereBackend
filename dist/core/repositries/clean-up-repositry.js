"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupRepository = void 0;
const error_handler_1 = require("../utils/error-handler");
const logger_1 = __importDefault(require("../utils/logger"));
const group_request_model_1 = __importDefault(require("../../Models/group-request-model"));
const mentor_requset_model_1 = __importDefault(require("../../Models/mentor-requset-model"));
const error_messages_1 = require("../../constants/error-messages");
class CleanupRepository {
    constructor() {
        // Delete old GroupRequest Documents
        this.deleteOldGroupRequests = async (cutoffDate) => {
            try {
                logger_1.default.debug(`Deleting GroupRequest documents older than ${cutoffDate}`);
                const result = await group_request_model_1.default.deleteMany({
                    updatedAt: { $lt: cutoffDate },
                }).exec();
                logger_1.default.info(`Deleted ${result.deletedCount} old GroupRequest documents`);
                return result.deletedCount || 0;
            }
            catch (error) {
                logger_1.default.error(`Failed to delete old GroupRequest documents: ${error.message}`);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_DELETE_OLD_GROUP_REQUESTS);
            }
        };
        // Delete old MentorRequest Documents
        this.deleteOldMentorRequests = async (cutoffDate) => {
            try {
                logger_1.default.debug(`Deleting MentorRequest documents older than ${cutoffDate}`);
                const result = await mentor_requset_model_1.default.deleteMany({
                    updatedAt: { $lt: cutoffDate },
                }).exec();
                logger_1.default.info(`Deleted ${result.deletedCount} old MentorRequest documents`);
                return result.deletedCount || 0;
            }
            catch (error) {
                logger_1.default.error(`Failed to delete old MentorRequest documents: ${error.message}`);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_DELETE_OLD_MENTOR_REQUESTS);
            }
        };
    }
}
exports.CleanupRepository = CleanupRepository;
//# sourceMappingURL=clean-up-repositry.js.map