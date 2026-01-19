"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const status_code_enums_1 = require("../../enums/status-code-enums");
class BaseController {
    constructor() {
        this.sendSuccess = (res, data, message = 'Success') => {
            logger_1.default.info(`Sending response: ${message}`);
            res.status(status_code_enums_1.StatusCodes.OK).json({
                status: 'success',
                message,
                data,
            });
        };
        this.sendCreated = (res, data, message = 'Created') => {
            logger_1.default.info(`Sending created response: ${message}`);
            res.status(status_code_enums_1.StatusCodes.CREATED).json({
                status: 'success',
                message,
                data,
            });
        };
        this.sendNoContent = (res, message = 'Deleted') => {
            logger_1.default.info(`Sending no content response: ${message}`);
            res.status(status_code_enums_1.StatusCodes.NO_CONTENT).send();
        };
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=base-controller.js.map