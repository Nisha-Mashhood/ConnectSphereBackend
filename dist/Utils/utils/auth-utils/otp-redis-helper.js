"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpFromRedis = exports.incrementOtpAttempts = exports.deleteOtpFromRedis = exports.getOtpFromRedis = exports.saveOtpToRedis = exports.generateOtpId = void 0;
const uuid_1 = require("uuid");
const redis_client_config_1 = require("../../../config/redis-client-config");
//Generate unique OTP session id
const generateOtpId = () => {
    return (0, uuid_1.v4)();
};
exports.generateOtpId = generateOtpId;
//Redis key for OTP
const buildOtpKey = (purpose, email, otpId) => {
    return `otp:${purpose}:${email}:${otpId}`;
};
//Save OTP to Redis with TTL
const saveOtpToRedis = async (payload, ttlSeconds = 300) => {
    const otpId = (0, exports.generateOtpId)();
    const key = buildOtpKey(payload.purpose, payload.email, otpId);
    await redis_client_config_1.redisClient.set(key, JSON.stringify(payload), "EX", ttlSeconds);
    return otpId;
};
exports.saveOtpToRedis = saveOtpToRedis;
//Get OTP from Redis
const getOtpFromRedis = async (purpose, email, otpId) => {
    const key = buildOtpKey(purpose, email, otpId);
    const value = await redis_client_config_1.redisClient.get(key);
    if (!value)
        return null;
    return JSON.parse(value);
};
exports.getOtpFromRedis = getOtpFromRedis;
//Delete OTP from Redis
const deleteOtpFromRedis = async (purpose, email, otpId) => {
    const key = buildOtpKey(purpose, email, otpId);
    await redis_client_config_1.redisClient.del(key);
};
exports.deleteOtpFromRedis = deleteOtpFromRedis;
//Increment OTP attempt count
const incrementOtpAttempts = async (purpose, email, otpId) => {
    const key = buildOtpKey(purpose, email, otpId);
    const value = await redis_client_config_1.redisClient.get(key);
    if (!value) {
        throw new Error("OTP session not found");
    }
    const payload = JSON.parse(value);
    payload.attempts += 1;
    await redis_client_config_1.redisClient.set(key, JSON.stringify(payload));
    return payload.attempts;
};
exports.incrementOtpAttempts = incrementOtpAttempts;
//Verify the otp with otpId
const verifyOtpFromRedis = async (purpose, email, otpId, providedOtp, maxAttempts = 5) => {
    const payload = await (0, exports.getOtpFromRedis)(purpose, email, otpId);
    if (!payload) {
        throw new Error("OTP expired or not found");
    }
    if (payload.otp !== providedOtp) {
        const attempts = await (0, exports.incrementOtpAttempts)(purpose, email, otpId);
        if (attempts >= maxAttempts) {
            await (0, exports.deleteOtpFromRedis)(purpose, email, otpId);
            throw new Error("Maximum OTP attempts exceeded");
        }
        throw new Error("Invalid OTP");
    }
    await (0, exports.deleteOtpFromRedis)(purpose, email, otpId);
    return payload;
};
exports.verifyOtpFromRedis = verifyOtpFromRedis;
//# sourceMappingURL=otp-redis-helper.js.map