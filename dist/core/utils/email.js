"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_config_1 = __importDefault(require("../../config/env-config"));
const logger_1 = __importDefault(require("./logger"));
const transporter = nodemailer_1.default.createTransport({
    service: env_config_1.default.emailService,
    auth: {
        user: env_config_1.default.emailUser,
        pass: env_config_1.default.emailPassword,
    },
});
const sendEmail = async (to, subject, text) => {
    if (!to) {
        throw new Error(' To address is undefined Failed to send Email');
    }
    try {
        await transporter.sendMail({
            from: env_config_1.default.emailUser,
            to,
            subject,
            text,
        });
    }
    catch (error) {
        logger_1.default.info(error);
        throw new Error('Failed to send email.');
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map