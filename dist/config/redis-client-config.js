"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_config_1 = __importDefault(require("./env-config"));
const redisUrl = env_config_1.default.redisclienturl;
if (!redisUrl) {
    throw new Error("REDIS_URL is not defined");
}
exports.redisClient = new ioredis_1.default(redisUrl);
exports.redisClient.on("connect", () => {
    console.log("✅ Redis Cloud connected");
});
exports.redisClient.on("ready", () => {
    console.log("✅ Redis Cloud ready");
});
exports.redisClient.on("error", (err) => {
    console.error("❌ Redis error:", err.message);
});
//# sourceMappingURL=redis-client-config.js.map