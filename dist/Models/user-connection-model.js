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
const mongoose_1 = __importStar(require("mongoose"));
const id_generator_1 = require("../core/utils/id-generator");
const logger_1 = __importDefault(require("../core/utils/logger"));
const UserConnectionSchema = new mongoose_1.Schema({
    connectionId: {
        type: String,
        unique: true,
    },
    requester: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    recipient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    requestStatus: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending",
    },
    connectionStatus: {
        type: String,
        enum: ["Connected", "Disconnected"],
        default: "Disconnected",
    },
    requestSentAt: {
        type: Date,
        default: Date.now,
    },
    requestAcceptedAt: {
        type: Date,
    },
    disconnectedAt: {
        type: Date,
    },
    disconnectionReason: {
        type: String,
        default: null,
    },
}, { timestamps: true });
// Pre-save hook to generate connectionId
UserConnectionSchema.pre("save", async function (next) {
    if (!this.connectionId) {
        try {
            this.connectionId = await (0, id_generator_1.generateCustomId)("userConnection", "UCN");
            logger_1.default.debug(`Generated connectionId: ${this.connectionId} for requester ${this.requester} and recipient: ${this.recipient}`);
        }
        catch (error) {
            logger_1.default.error(`Error generating connectionId for requester: ${this.requester} and recipient: ${this.recipient}: ${error}`);
            return next(error);
        }
    }
    next();
});
exports.default = mongoose_1.default.model("UserConnection", UserConnectionSchema);
//# sourceMappingURL=user-connection-model.js.map