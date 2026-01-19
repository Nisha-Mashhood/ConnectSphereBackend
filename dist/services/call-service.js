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
exports.CallService = void 0;
const inversify_1 = require("inversify");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
let CallService = class CallService {
    constructor(callLogRepository) {
        this.getCallLogsByUserId = async (userId) => {
            try {
                if (!userId) {
                    logger_1.default.error("User ID is required");
                    throw new error_handler_1.ServiceError("User ID is required");
                }
                logger_1.default.debug(`Fetching call logs for userId: ${userId}`);
                const callLogs = await this._callLogRepository.findCallLogsByUserId(userId);
                logger_1.default.info(`Retrieved ${callLogs.length} call logs for userId: ${userId}`);
                return callLogs;
            }
            catch (error) {
                logger_1.default.error(`Error in CallService.getCallLogsByUserId: ${error.message}`);
                throw new error_handler_1.ServiceError(`Failed to fetch call logs: ${error.message}`);
            }
        };
        this._callLogRepository = callLogRepository;
    }
};
exports.CallService = CallService;
exports.CallService = CallService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('ICallLogRepository')),
    __metadata("design:paramtypes", [Object])
], CallService);
//# sourceMappingURL=call-service.js.map