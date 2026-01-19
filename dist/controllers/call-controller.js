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
exports.CallController = void 0;
const base_controller_1 = require("../core/controller/base-controller");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const inversify_1 = require("inversify");
const error_messages_1 = require("../constants/error-messages");
const messages_1 = require("../constants/messages");
let CallController = class CallController extends base_controller_1.BaseController {
    constructor(callService) {
        super();
        this._callService = callService;
    }
    async getCallLogsByUserId(req, res, next) {
        try {
            const userId = req.currentUser?._id;
            if (!userId) {
                logger_1.default.error("User ID not provided in request");
                throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID, status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            logger_1.default.debug(`Handling request to get call logs for userId: ${userId}`);
            const callLogs = await this._callService.getCallLogsByUserId(userId?.toString());
            if (callLogs) {
                logger_1.default.info("call Log fetched : ", callLogs);
            }
            if (callLogs.length === 0) {
                this.sendSuccess(res, [], messages_1.CALL_MESSAGES.NO_CALL_LOGS_FOUND);
                logger_1.default.info(`No call logs found for userId: ${userId}`);
                return;
            }
            this.sendSuccess(res, callLogs, messages_1.CALL_MESSAGES.CALL_LOGS_RETRIEVED);
        }
        catch (error) {
            logger_1.default.error(`Error in CallController.getCallLogsByUserId: ${error.message}`);
            next(error);
        }
    }
};
exports.CallController = CallController;
exports.CallController = CallController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('ICallService')),
    __metadata("design:paramtypes", [Object])
], CallController);
//# sourceMappingURL=call-controller.js.map