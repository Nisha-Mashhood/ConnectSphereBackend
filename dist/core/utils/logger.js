"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const node_1 = require("@logtail/node");
const winston_2 = require("@logtail/winston");
const env_config_1 = __importDefault(require("../../config/env-config"));
const isProduction = env_config_1.default.node_env === "production" || env_config_1.default.node_env === "staging";
const logtailToken = env_config_1.default.logToken || process.env.BETTERSTACK_LOG_TOKEN || "";
const logtailEndpoint = env_config_1.default.logEndPoint || process.env.BETTERSTACK_LOG_ENDPOINT;
// Create Logtail instance only when we have valid token
let logtailTransport = null;
if (logtailToken && isProduction) {
    try {
        const logtail = new node_1.Logtail(logtailToken, {
            endpoint: logtailEndpoint || undefined,
        });
        logtailTransport = new winston_2.LogtailTransport(logtail);
    }
    catch (err) {
        console.error("Failed to initialize BetterStack/Logtail:", err);
    }
}
const logger = winston_1.default.createLogger({
    level: env_config_1.default.logLevel || "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : "";
        return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr ? " " + metaStr : ""}`;
    })),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
        }),
        ...(logtailTransport ? [logtailTransport] : []),
    ],
});
if (!logtailToken && isProduction) {
    logger.warn("BetterStack/Logtail token is missing in production environment!\n" +
        "Cloud logging is disabled. Check your environment variables.");
}
if (env_config_1.default.node_env !== "production") {
    logger.debug("Logger initialized successfully (development mode)");
}
exports.default = logger;
//# sourceMappingURL=logger.js.map