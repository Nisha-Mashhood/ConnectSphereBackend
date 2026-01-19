"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const id_generator_1 = require("../core/utils/id-generator");
const logger_1 = __importDefault(require("../core/utils/logger"));
const taskSchema = new mongoose_1.default.Schema({
    taskId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
    },
    status: {
        type: String,
        enum: ["pending", "in-progress", "completed", "not-completed"],
        default: "pending",
    },
    startDate: {
        type: Date,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    notificationDate: {
        type: Date,
    },
    notificationTime: {
        type: String,
    },
    contextType: {
        type: String,
        enum: ["user", "group", "collaboration"],
        required: true,
    },
    contextId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        refPath: "contextType",
    },
    // Connections for public tasks
    assignedUsers: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
});
taskSchema.pre("save", async function (next) {
    try {
        // Generate taskId if not set
        if (!this.taskId) {
            this.taskId = await (0, id_generator_1.generateCustomId)("task", "TSK");
            logger_1.default.debug(`Generated taskId: ${this.taskId} for task: ${this.name}`);
        }
        // Update status if past due date
        if (this.dueDate &&
            new Date() > this.dueDate &&
            this.status !== "completed") {
            this.status = "not-completed";
            logger_1.default.debug(`Updated status to not-completed for task: ${this.taskId} due to past due date: ${this.dueDate}`);
        }
        next();
    }
    catch (error) {
        logger_1.default.error(`Error in pre-save hook for task: ${this.name || "unnamed"}: ${error}`);
        next(error);
    }
});
exports.Task = mongoose_1.default.model("Task", taskSchema);
//# sourceMappingURL=task-model.js.map