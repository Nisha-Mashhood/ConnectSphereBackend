"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpAndStore = exports.generateOTP = void 0;
const otp_redis_helper_1 = require("./otp-redis-helper");
const email_1 = require("../../../core/utils/email");
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
exports.generateOTP = generateOTP;
const sendOtpAndStore = async (params) => {
    const { email, purpose, emailSubject, emailBody, ttlSeconds = 300, } = params;
    const normalizedEmail = email.toLowerCase().trim();
    // const todayDate = new Date();
    const otp = (0, exports.generateOTP)(); //generate otp
    const otpId = await (0, otp_redis_helper_1.saveOtpToRedis)(//save to redis
    {
        otp,
        email: normalizedEmail,
        purpose,
        attempts: 0,
        createdAt: Date.now(),
    }, ttlSeconds);
    await (0, email_1.sendEmail)(//send email
    normalizedEmail, emailSubject, emailBody(otp));
    console.log("OTP SENT SUCCESSFULLY :", otp);
    return otpId;
};
exports.sendOtpAndStore = sendOtpAndStore;
//# sourceMappingURL=o-t-p.js.map