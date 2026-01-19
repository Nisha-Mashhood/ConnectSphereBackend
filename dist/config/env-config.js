"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const env = (process.env.NODE_ENV || 'development').toLowerCase();
// Only load .env file when we are in DEVELOPMENT
if (env === 'development') {
    // load .env.development
    dotenv.config({
        path: path_1.default.join(process.cwd(), '.env.development')
    });
}
const config = {
    port: process.env.PORT || 3000,
    adminEmail: process.env.ADMIN_EMAIL,
    defaultprofilepic: process.env.DEFAULT_PROFILE_PIC,
    defaultcoverpic: process.env.DEFAULT_COVER_PIC,
    node_env: process.env.NODE_ENV,
    mongoURI: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_key',
    emailService: process.env.EMAIL_SERVICE,
    emailUser: process.env.EMAIL_USER,
    emailPassword: process.env.EMAIL_PASS,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    googleclientid: process.env.GOOGLE_CLIENT_ID,
    googleclientsecret: process.env.GOOGLE_CLIENT_SECRET,
    githubclientid: process.env.GITHUB_CLIENT_ID,
    githubclientsecret: process.env.GITHUB_CLIENT_SECRET,
    githubcallbackurl: process.env.GITHUB_CALLBACK_URL,
    baseurl: process.env.BASE_URL,
    frontendurl: process.env.FRONTEND_URL,
    sessionsecret: process.env.SESSION_SECRET,
    adminpasscode: process.env.PASSKEY_ADMIN,
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
    vapidEmail: process.env.VAPID_EMAIL,
    redisclienturl: process.env.REDIS_URL,
    logLevel: process.env.LOG_LEVEL,
    logToken: process.env.BETTERSTACK_LOG_TOKEN,
    logEndPoint: process.env.BETTERSTACK_LOG_ENDPOINT,
};
exports.default = config;
//# sourceMappingURL=env-config.js.map