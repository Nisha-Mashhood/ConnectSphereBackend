"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof error_handler_1.AppError) {
        logger_1.default.error(`[Handled] ${err.name}: ${err.message}`);
        res.status(err.statusCode).json({
            status: "error",
            error: err.name,
            message: err.message,
            details: err.details || null,
        });
        return;
    }
    logger_1.default.error(`[Unhandled] ${err.name}: ${err.message}\n${err.stack}`);
    res.status(500).json({
        status: "error",
        error: "InternalServerError",
        message: "Something went wrong. Please try again later.",
    });
};
exports.errorHandler = errorHandler;
process.on("unhandledRejection", (reason, promise) => {
    logger_1.default.error(`Unhandled Rejection at: ${promise}\nReason: ${reason?.message || reason}\nStack: ${reason?.stack || "No stack trace"}`);
});
//# sourceMappingURL=error-handler-middleware.js.map