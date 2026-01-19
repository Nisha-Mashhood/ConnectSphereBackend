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
const logger_1 = __importDefault(require("../core/utils/logger"));
const id_generator_1 = require("../core/utils/id-generator");
const MentorExperienceSchema = new mongoose_1.Schema({
    mentorExperienceId: {
        type: String,
        unique: true,
    },
    mentorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Mentor",
        required: true,
        index: true,
    },
    role: {
        type: String,
        required: true,
        trim: true,
    },
    organization: {
        type: String,
        required: true,
        trim: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
    },
    isCurrent: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String,
        maxlength: 500,
    },
}, {
    timestamps: true,
});
// Pre-save hook to generate mentorExperineceId
MentorExperienceSchema.pre("save", async function (next) {
    if (!this.mentorExperienceId) {
        try {
            this.mentorExperienceId = await (0, id_generator_1.generateCustomId)("mentorExperience", "MTREXP");
            logger_1.default.debug(`Generated mentorexperineceId: ${this.mentorExperienceId} for mentorId ${this.mentorId}`);
        }
        catch (error) {
            logger_1.default.error(`Error generating mentorexperineceId: ${this.mentorExperienceId} for mentorId ${this.mentorId} : ${error}`);
            return next(error);
        }
    }
    next();
});
exports.default = mongoose_1.default.model("MentorExperience", MentorExperienceSchema);
//# sourceMappingURL=mentor-experience-model.js.map