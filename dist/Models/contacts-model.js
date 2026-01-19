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
const contactSchema = new mongoose_1.default.Schema({
    contactId: {
        type: String,
        unique: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    targetUserId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    }, // Optional: mentor or user
    collaborationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Collaboration",
    },
    userConnectionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "UserConnection",
    },
    groupId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Group",
    },
    type: {
        type: String,
        enum: ["user-mentor", "user-user", "group"],
        required: true,
    },
}, { timestamps: true });
// Pre-save hook to generate contactId
contactSchema.pre("save", async function (next) {
    if (!this.contactId) {
        try {
            this.contactId = await (0, id_generator_1.generateCustomId)("contact", "CNT");
            logger_1.default.debug(`Generated contactId: ${this.contactId} for userId ${this.userId}`);
        }
        catch (error) {
            logger_1.default.error(`Error generating contactId: ${this.contactId} for userId ${this.userId} : ${error}`);
            return next(error);
        }
    }
    next();
});
// contactId is set for bulk operations like insertMany
contactSchema.pre("insertMany", async function (next, docs) {
    for (const doc of docs) {
        if (!doc.contactId) {
            doc.contactId = await (0, id_generator_1.generateCustomId)("contact", "CNT");
        }
    }
    next();
});
exports.default = mongoose_1.default.model("Contact", contactSchema);
//# sourceMappingURL=contacts-model.js.map