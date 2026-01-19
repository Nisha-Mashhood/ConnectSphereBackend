"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSubcategoryDTO = toSubcategoryDTO;
exports.toSubcategoryDTOs = toSubcategoryDTOs;
const category_mapper_1 = require("./category-mapper");
const logger_1 = __importDefault(require("../../core/utils/logger"));
const mongoose_1 = require("mongoose");
function toSubcategoryDTO(subcategory) {
    if (!subcategory) {
        logger_1.default.warn('Attempted to map null subcategory to DTO');
        return null;
    }
    let categoryId;
    let category;
    if (subcategory.categoryId) {
        if (typeof subcategory.categoryId === 'string') {
            categoryId = subcategory.categoryId;
        }
        else if (subcategory.categoryId instanceof mongoose_1.Types.ObjectId) {
            categoryId = subcategory.categoryId.toString();
        }
        else {
            //ICategory object (populated)
            categoryId = subcategory.categoryId._id.toString();
            const categoryDTO = (0, category_mapper_1.toCategoryDTO)(subcategory.categoryId);
            category = categoryDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Subcategory ${subcategory._id} has no categoryId`);
        categoryId = '';
    }
    return {
        id: subcategory._id.toString(),
        subcategoryId: subcategory.subcategoryId,
        name: subcategory.name,
        categoryId,
        category,
        description: subcategory.description,
        imageUrl: subcategory.imageUrl ?? undefined,
        createdAt: subcategory.createdAt,
        updatedAt: subcategory.updatedAt,
    };
}
function toSubcategoryDTOs(subcategories) {
    return subcategories
        .map(toSubcategoryDTO)
        .filter((dto) => dto !== null);
}
//# sourceMappingURL=subcategory-mapper.js.map