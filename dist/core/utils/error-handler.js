"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryError = exports.ServiceError = exports.HttpError = exports.AppError = void 0;
const logger_1 = __importDefault(require("./logger"));
class AppError extends Error {
    constructor(message, statusCode = 500, details) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.details = details;
        this.name = "AppError";
        logger_1.default.error(`[${this.name}] ${message} (Status: ${statusCode})`);
    }
}
exports.AppError = AppError;
// HTTP Error (Controller-level)
class HttpError extends AppError {
    constructor(message, statusCode = 400, details) {
        super(message, statusCode, details);
        this.name = "HttpError";
    }
}
exports.HttpError = HttpError;
// Service Error
class ServiceError extends AppError {
    constructor(message, statusCode = 500, details) {
        super(message, statusCode, details);
        this.name = "ServiceError";
    }
}
exports.ServiceError = ServiceError;
// Repository Error
class RepositoryError extends AppError {
    constructor(message, statusCode = 500, details) {
        super(message, statusCode, details);
        this.name = "RepositoryError";
    }
}
exports.RepositoryError = RepositoryError;
//# sourceMappingURL=error-handler.js.map