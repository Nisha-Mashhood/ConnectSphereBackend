"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppNotificationModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const id_generator_1 = require("../core/utils/id-generator");
const logger_1 = __importDefault(require("../core/utils/logger"));
const AppNotificationSchema = new mongoose_2.Schema({
    AppNotificationId: {
        type: String,
        unique: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ["message", "incoming_call", "missed_call", "task_reminder", "new_user", 'new_mentor', 'mentor_approved', 'collaboration_status'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    relatedId: {
        type: String,
        required: true,
    },
    senderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["unread", "read"],
        default: "unread",
    },
    callId: {
        type: String,
        required: false,
    },
    callType: {
        type: String,
        enum: ["audio", "video"],
        required: false
    },
    notificationDate: {
        type: Date,
        required: false,
    },
    notificationTime: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    taskContext: {
        contextType: {
            type: String,
            enum: ["user", "group", "collaboration", "userconnection"],
            required: false,
        },
        contextId: {
            type: String,
            required: false,
        },
    },
});
AppNotificationSchema.index({ userId: 1, createdAt: -1 });
// Pre-save hook to generate AppNotificationId
AppNotificationSchema.pre("save", async function (next) {
    if (!this.AppNotificationId) {
        try {
            this.AppNotificationId = await (0, id_generator_1.generateCustomId)("appNotification", "ANF");
            logger_1.default.debug(`Generated AppNotificationId: ${this.AppNotificationId} for userId ${this.userId}`);
        }
        catch (error) {
            logger_1.default.error(`Error generating AppNotificationId: ${this.AppNotificationId} for userId ${this.userId} : ${error}`);
            return next(error);
        }
    }
    next();
});
exports.AppNotificationModel = (0, mongoose_2.model)("AppNotification", AppNotificationSchema);
//# sourceMappingURL=notification-model.js.map