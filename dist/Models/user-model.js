"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_config_1 = __importDefault(require("../config/env-config"));
const id_generator_1 = require("../core/utils/id-generator");
const logger_1 = __importDefault(require("../core/utils/logger"));
const userSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
    },
    dateOfBirth: {
        type: Date,
    },
    password: {
        type: String,
        default: null,
    },
    jobTitle: {
        type: String,
        default: null,
    },
    industry: {
        type: String,
        default: null,
    },
    reasonForJoining: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ["user", "mentor", "admin"],
        default: "user",
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    provider: {
        type: String,
        enum: ["google", "facebook", "github"],
        default: null,
    },
    providerId: {
        type: String,
        default: null,
    },
    profilePic: {
        type: String,
        default: env_config_1.default.defaultprofilepic,
    },
    coverPic: {
        type: String,
        default: env_config_1.default.defaultcoverpic,
    },
    accessToken: {
        type: String,
        default: null,
        required: false,
    },
    refreshToken: {
        type: String,
        default: null,
        required: false,
    },
    loginCount: {
        type: Number,
        default: 0,
    },
    hasReviewed: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
// Pre-save hook to generate userId
userSchema.pre("save", async function (next) {
    if (!this.userId) {
        try {
            this.userId = await (0, id_generator_1.generateCustomId)("user", "USR");
            logger_1.default.debug(`Generated userId: ${this.userId} for email: ${this.email}`);
        }
        catch (error) {
            logger_1.default.error(`Error generating userId for email: ${this.email}: ${error}`);
            return next(error);
        }
    }
    next();
});
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
//# sourceMappingURL=user-model.js.map