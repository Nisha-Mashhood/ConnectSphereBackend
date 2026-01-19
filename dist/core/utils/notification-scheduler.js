"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = __importDefault(require("./logger"));
const error_handler_1 = require("./error-handler");
const clean_up_repositry_1 = require("../repositries/clean-up-repositry");
class CleanupScheduler {
    constructor() {
        this.cleanupRepo = new clean_up_repositry_1.CleanupRepository();
    }
    async start() {
        logger_1.default.info("✅ Cleanup scheduler started.");
        // Run cleanup once immediately at server start
        await this.runCleanup();
        // Schedule daily cleanup at midnight
        node_cron_1.default.schedule('0 0 * * *', () => {
            this.runCleanup();
        });
    }
    async runCleanup() {
        logger_1.default.info('🧹 Running cleanup task for old requests');
        try {
            const fifteenDaysAgo = new Date();
            fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
            const deletedGroupRequests = await this.cleanupRepo.deleteOldGroupRequests(fifteenDaysAgo);
            const deletedMentorRequests = await this.cleanupRepo.deleteOldMentorRequests(fifteenDaysAgo);
            logger_1.default.info(`✅ Cleanup Summary: Deleted ${deletedGroupRequests} group requests, ${deletedMentorRequests} mentor requests`);
        }
        catch (error) {
            logger_1.default.error(`❌ Cleanup task failed: ${error.message}`);
            throw new error_handler_1.RepositoryError(`Cleanup task failed: ${error.message}`);
        }
    }
}
exports.CleanupScheduler = CleanupScheduler;
//# sourceMappingURL=notification-scheduler.js.map