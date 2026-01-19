"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const id_generator_1 = require("../core/utils/id-generator");
const logger_1 = __importDefault(require("../core/utils/logger"));
const categorySchema = new mongoose_1.default.Schema({
    categoryId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        default: null,
    },
    imageUrl: {
        type: String,
        default: null,
    },
}, { timestamps: true });
// Pre-save hook to generate categoryId
categorySchema.pre("save", async function (next) {
    if (!this.categoryId) {
        try {
            this.categoryId = await (0, id_generator_1.generateCustomId)("category", "CAT");
            logger_1.default.debug(`Generated categoryId: ${this.categoryId} for name ${this.name}`);
        }
        catch (error) {
            logger_1.default.error(`Error generating categoryId: ${this.categoryId} for name ${this.name} : ${error}`);
            return next(error);
        }
    }
    next();
});
exports.Category = mongoose_1.default.model("Category", categorySchema);
//# sourceMappingURL=category-model.js.map