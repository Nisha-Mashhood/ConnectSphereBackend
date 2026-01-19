"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCategoryDTO = toCategoryDTO;
exports.toCategoryDTOs = toCategoryDTOs;
const logger_1 = __importDefault(require("../../core/utils/logger"));
function toCategoryDTO(category) {
    if (!category) {
        logger_1.default.warn('Attempted to map null category to DTO');
        return null;
    }
    return {
        id: category._id.toString(),
        categoryId: category.categoryId,
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
    };
}
function toCategoryDTOs(categories) {
    return categories
        .map(toCategoryDTO)
        .filter((dto) => dto !== null);
}
//# sourceMappingURL=category-mapper.js.map