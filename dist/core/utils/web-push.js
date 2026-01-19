"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web_push_1 = __importDefault(require("web-push"));
const dotenv_1 = __importDefault(require("dotenv"));
const env_config_1 = __importDefault(require("../../config/env-config"));
dotenv_1.default.config();
if (!env_config_1.default.vapidEmail || !env_config_1.default.vapidPublicKey || !env_config_1.default.vapidPrivateKey) {
    throw new Error("❌ Missing VAPID keys! Check your .env file.");
}
web_push_1.default.setVapidDetails(`mailto:${env_config_1.default.vapidEmail}`, env_config_1.default.vapidPublicKey, env_config_1.default.vapidPrivateKey);
exports.default = web_push_1.default;
//# sourceMappingURL=web-push.js.map