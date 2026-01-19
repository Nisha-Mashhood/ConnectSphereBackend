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
const GroupSchema = new mongoose_1.Schema({
    groupId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        default: 0,
    },
    maxMembers: {
        type: Number,
        required: true,
    },
    isFull: {
        type: Boolean,
        default: false,
    },
    availableSlots: [
        {
            day: {
                type: String,
                required: true,
            },
            timeSlots: [
                {
                    type: String,
                    required: true,
                },
            ],
        },
    ],
    profilePic: {
        type: String,
        default: "",
    },
    coverPic: {
        type: String,
        default: "",
    },
    startDate: {
        type: Date,
        required: true,
    },
    adminId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    members: [
        {
            userId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
// Pre-save hook to generate groupId
GroupSchema.pre("save", async function (next) {
    if (!this.groupId) {
        try {
            this.groupId = await (0, id_generator_1.generateCustomId)("group", "GRP");
            logger_1.default.debug(`Generated groupId: ${this.groupId} for name ${this.name}`);
        }
        catch (error) {
            logger_1.default.error(`Error generating groupId: ${this.groupId} for name ${this.name} : ${error}`);
            return next(error);
        }
    }
    next();
});
const Group = mongoose_1.default.model("Group", GroupSchema);
exports.default = Group;
//# sourceMappingURL=group-model.js.map