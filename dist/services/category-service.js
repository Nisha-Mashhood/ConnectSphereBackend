"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const inversify_1 = require("inversify");
const logger_1 = __importDefault(require("../core/utils/logger"));
const cloudinary_1 = require("../core/utils/cloudinary");
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const category_mapper_1 = require("../Utils/mappers/category-mapper");
let CategoryService = class CategoryService {
    constructor(categoryRepository, subcategoryRepository, skillsRepository) {
        this.isDuplicateCategoryName = async (name, excludeId) => {
            try {
                logger_1.default.debug(`Checking duplicate category name: ${name}`);
                const isDuplicate = await this.categoryRepo.isDuplicateCategoryName(name, excludeId);
                return isDuplicate;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error checking duplicate category name ${name}: ${err.message}`);
                throw new error_handler_1.ServiceError("Failed to check duplicate category name", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.createCategory = async (data, imagePath, fileSize) => {
            try {
                logger_1.default.debug(`Creating category with name: ${data.name}`);
                let imageUrl = '';
                if (imagePath) {
                    const folder = "categories";
                    const { url } = await (0, cloudinary_1.uploadMedia)(imagePath, folder, fileSize);
                    imageUrl = url;
                    logger_1.default.info(`Uploaded image for category: ${imageUrl}`);
                }
                const category = await this.categoryRepo.createCategory({
                    ...data,
                    imageUrl,
                });
                const categoryDTO = (0, category_mapper_1.toCategoryDTO)(category);
                if (!categoryDTO) {
                    logger_1.default.error(`Failed to map category ${category._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map category to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Category created: ${category._id} (${category.name})`);
                return categoryDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating category: ${err.message}`);
                throw new error_handler_1.ServiceError("Failed to create category", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllCategories = async (query = {}) => {
            try {
                logger_1.default.debug(`Fetching all categories with query: ${JSON.stringify(query)}`);
                const result = await this.categoryRepo.getAllCategories(query);
                const categoriesDTO = (0, category_mapper_1.toCategoryDTOs)(result.categories);
                ;
                logger_1.default.info(`Fetched categories with total ${result.total}`);
                return { categories: categoriesDTO, total: result.total };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching categories: ${err.message}`);
                throw new error_handler_1.ServiceError("Failed to fetch categories", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.fetchAllCategories = async () => {
            try {
                logger_1.default.debug(`Fetching all categories`);
                const result = await this.categoryRepo.fetchAllCategories();
                const categoriesDTO = (0, category_mapper_1.toCategoryDTOs)(result.categories);
                ;
                return { categories: categoriesDTO };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching categories: ${err.message}`);
                throw new error_handler_1.ServiceError("Failed to fetch categories", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getCategoryById = async (id) => {
            try {
                logger_1.default.debug(`Fetching category: ${id}`);
                const category = await this.categoryRepo.getCategoryById(id);
                if (!category) {
                    logger_1.default.warn(`Category not found: ${id}`);
                    throw new error_handler_1.ServiceError("Category not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const categoryDTO = (0, category_mapper_1.toCategoryDTO)(category);
                if (!categoryDTO) {
                    logger_1.default.error(`Failed to map category ${id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map category to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Category fetched: ${id} (${category.name})`);
                return categoryDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching category ${id}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch category", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateCategory = async (id, data, imagePath, fileSize) => {
            try {
                logger_1.default.debug(`Updating category: ${id}`);
                let imageId = null;
                if (imagePath) {
                    const folder = "categories";
                    const { url } = await (0, cloudinary_1.uploadMedia)(imagePath, folder, fileSize);
                    imageId = url;
                    logger_1.default.info(`Uploaded image for category: ${imageId}`);
                }
                const category = await this.categoryRepo.updateCategory(id, {
                    ...data,
                    ...(imageId && { imageId }),
                });
                if (!category) {
                    logger_1.default.warn(`Category not found for update: ${id}`);
                    throw new error_handler_1.ServiceError("Category not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const categoryDTO = (0, category_mapper_1.toCategoryDTO)(category);
                if (!categoryDTO) {
                    logger_1.default.error(`Failed to map category ${id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map category to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Category updated: ${id} (${category.name})`);
                return categoryDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating category ${id}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to update category", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteCategory = async (id) => {
            try {
                logger_1.default.debug(`Deleting category: ${id}`);
                await this.subcategoryRepo.deleteManySubcategories(id);
                logger_1.default.info(`Deleted subcategories for category: ${id}`);
                await this.skillsRepo.deleteManySkills(id);
                logger_1.default.info(`Deleted skills for category: ${id}`);
                const category = await this.categoryRepo.deleteCategory(id);
                if (!category) {
                    logger_1.default.warn(`Category not found for deletion: ${id}`);
                    throw new error_handler_1.ServiceError("Category not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const categoryDTO = (0, category_mapper_1.toCategoryDTO)(category);
                if (!categoryDTO) {
                    logger_1.default.error(`Failed to map category ${id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map category to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Category deleted: ${id} (${category.name})`);
                return categoryDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting category ${id}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to delete category and related data", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.categoryRepo = categoryRepository;
        this.subcategoryRepo = subcategoryRepository;
        this.skillsRepo = skillsRepository;
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('ICategoryRepository')),
    __param(1, (0, inversify_1.inject)('ISubCategoryRepository')),
    __param(2, (0, inversify_1.inject)('ISkillsRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], CategoryService);
//# sourceMappingURL=category-service.js.map