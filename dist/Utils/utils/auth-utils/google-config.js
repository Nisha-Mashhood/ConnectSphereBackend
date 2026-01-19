"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuth2Client = void 0;
const googleapis_1 = require("googleapis");
const env_config_1 = __importDefault(require("../../../config/env-config"));
const clientId = env_config_1.default.googleclientid;
const clientSecret = env_config_1.default.googleclientsecret;
exports.OAuth2Client = new googleapis_1.google.auth.OAuth2(clientId, clientSecret, 'postmessage');
//# sourceMappingURL=google-config.js.map