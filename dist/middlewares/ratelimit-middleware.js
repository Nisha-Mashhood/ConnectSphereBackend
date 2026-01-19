"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.apiLimiter = (0, express_rate_limit_1.default)({
    //windowMs: 15 * 60 * 1000, // 15 minutes
    windowMs: 10 * 1000, //10 sec
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        status: 429,
        message: "Too many requests, please try again later.",
    },
    headers: true,
});
// stricter limiter for auth routes
exports.authLimiter = (0, express_rate_limit_1.default)({
    //windowMs: 60 * 60 * 1000, // 1 hour
    windowMs: 10 * 1000, //10 sec
    max: 20, // Limit each IP to 5 requests per windowMs
    message: {
        status: 429,
        message: "Too many requests, please try again later.",
    },
    headers: true,
});
//# sourceMappingURL=ratelimit-middleware.js.map