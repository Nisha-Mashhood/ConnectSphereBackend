"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSkillDTO = toSkillDTO;
exports.toSkillDTOs = toSkillDTOs;
const category_mapper_1 = require("./category-mapper");
const subcategory_mapper_1 = require("./subcategory-mapper");
const logger_1 = __importDefault(require("../../core/utils/logger"));
const mongoose_1 = require("mongoose");
function toSkillDTO(skill) {
    if (!skill) {
        logger_1.default.warn('Attempted to map null skill to DTO');
        return null;
    }
    let categoryId;
    let category;
    if (skill.categoryId) {
        if (typeof skill.categoryId === 'string') {
            categoryId = skill.categoryId;
        }
        else if (skill.categoryId instanceof mongoose_1.Types.ObjectId) {
            categoryId = skill.categoryId.toString();
        }
        else {
            //ICategory object (populated)
            categoryId = skill.categoryId._id.toString();
            const categoryDTO = (0, category_mapper_1.toCategoryDTO)(skill.categoryId);
            category = categoryDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Skill ${skill._id} has no categoryId`);
        categoryId = '';
    }
    let subcategoryId;
    let subcategory;
    if (skill.subcategoryId) {
        if (typeof skill.subcategoryId === 'string') {
            subcategoryId = skill.subcategoryId;
        }
        else if (skill.subcategoryId instanceof mongoose_1.Types.ObjectId) {
            subcategoryId = skill.subcategoryId.toString();
        }
        else {
            //ISubcategory object (populated)
            subcategoryId = skill.subcategoryId._id.toString();
            const subcategoryDTO = (0, subcategory_mapper_1.toSubcategoryDTO)(skill.subcategoryId);
            subcategory = subcategoryDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Skill ${skill._id} has no subcategoryId`);
        subcategoryId = '';
    }
    return {
        id: skill._id.toString(),
        skillId: skill.skillId,
        name: skill.name,
        categoryId,
        category,
        subcategoryId,
        subcategory,
        description: skill.description,
        imageUrl: skill.imageUrl ?? undefined,
        createdAt: skill.createdAt,
        updatedAt: skill.updatedAt,
    };
}
function toSkillDTOs(skills) {
    return skills
        .map(toSkillDTO)
        .filter((dto) => dto !== null);
}
//# sourceMappingURL=skill-mapper.js.map