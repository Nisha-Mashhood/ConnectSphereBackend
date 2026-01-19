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
exports.SubcategoryService = void 0;
const inversify_1 = require("inversify");
const logger_1 = __importDefault(require("../core/utils/logger"));
const cloudinary_1 = require("../core/utils/cloudinary");
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const subcategory_mapper_1 = require("../Utils/mappers/subcategory-mapper");
let SubcategoryService = class SubcategoryService {
    constructor(subcategoryRepository, skillsRepository) {
        this.createSubcategory = async (data, imagePath, fileSize) => {
            try {
                logger_1.default.debug(`Creating subcategory: ${data.name} for category ${data.categoryId}`);
                if (!data.name || !data.categoryId) {
                    logger_1.default.error("Missing required fields: name or categoryId");
                    throw new error_handler_1.ServiceError("Subcategory name and category ID are required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const isDuplicate = await this._subcategoryRepository.isDuplicateSubcategory(data.name, data.categoryId.toString());
                if (isDuplicate) {
                    logger_1.default.warn(`Subcategory name '${data.name}' already exists in category ${data.categoryId}`);
                    throw new error_handler_1.ServiceError("Subcategory name already exists in this category", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                let imageUrl = null;
                if (imagePath) {
                    const folder = "sub-categories";
                    const { url } = await (0, cloudinary_1.uploadMedia)(imagePath, folder, fileSize);
                    imageUrl = url;
                    logger_1.default.info(`Uploaded image for subcategory: ${imageUrl}`);
                }
                const subcategory = await this._subcategoryRepository.createSubcategory({ ...data, imageUrl });
                const subcategoryDTO = (0, subcategory_mapper_1.toSubcategoryDTO)(subcategory);
                if (!subcategoryDTO) {
                    logger_1.default.error(`Failed to map subcategory ${subcategory._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map subcategory to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Subcategory created: ${subcategory._id} (${subcategory.name})`);
                return subcategoryDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating subcategory ${data.name}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to create subcategory", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllSubcategories = async (categoryId, query) => {
            try {
                logger_1.default.debug(`Service: Fetching subcategories for category: ${categoryId}`);
                const result = await this._subcategoryRepository.getAllSubcategories(categoryId, query);
                const subcategoriesDTO = (0, subcategory_mapper_1.toSubcategoryDTOs)(result.subcategories);
                return { subcategories: subcategoriesDTO, total: result.total };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error in SubcategoryService: ${err.message}`);
                throw new error_handler_1.ServiceError("Failed to fetch subcategories", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getSubcategoryById = async (id) => {
            try {
                logger_1.default.debug(`Fetching subcategory: ${id}`);
                const subcategory = await this._subcategoryRepository.getSubcategoryById(id);
                if (!subcategory) {
                    logger_1.default.warn(`Subcategory not found: ${id}`);
                    throw new error_handler_1.ServiceError("Subcategory not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const subcategoryDTO = (0, subcategory_mapper_1.toSubcategoryDTO)(subcategory);
                if (!subcategoryDTO) {
                    logger_1.default.error(`Failed to map subcategory ${id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map subcategory to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Subcategory fetched: ${id} (${subcategory.name})`);
                return subcategoryDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching subcategory ${id}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch subcategory", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateSubcategory = async (id, data, imagePath, fileSize) => {
            try {
                logger_1.default.debug(`Updating subcategory: ${id}`);
                if (data.name) {
                    const existingSubcategory = await this._subcategoryRepository.getSubcategoryById(id);
                    if (!existingSubcategory) {
                        logger_1.default.warn(`Subcategory not found for update: ${id}`);
                        throw new error_handler_1.ServiceError("Subcategory not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                    }
                    const isDuplicate = await this._subcategoryRepository.isDuplicateSubcategory(data.name, existingSubcategory.categoryId._id.toString(), id);
                    if (isDuplicate) {
                        logger_1.default.warn(`Subcategory name '${data.name}' already exists in category ${existingSubcategory.categoryId}`);
                        throw new error_handler_1.ServiceError("Subcategory name already exists in this category", status_code_enums_1.StatusCodes.BAD_REQUEST);
                    }
                }
                let imageUrl = null;
                if (imagePath) {
                    const folder = "sub-categories";
                    const { url } = await (0, cloudinary_1.uploadMedia)(imagePath, folder, fileSize);
                    imageUrl = url;
                    logger_1.default.info(`Uploaded image for subcategory: ${imageUrl}`);
                }
                const subcategory = await this._subcategoryRepository.updateSubcategory(id, {
                    ...data,
                    ...(imageUrl && { imageUrl }),
                });
                if (!subcategory) {
                    logger_1.default.warn(`Subcategory not found for update: ${id}`);
                    throw new error_handler_1.ServiceError("Subcategory not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const subcategoryDTO = (0, subcategory_mapper_1.toSubcategoryDTO)(subcategory);
                if (!subcategoryDTO) {
                    logger_1.default.error(`Failed to map subcategory ${id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map subcategory to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Subcategory updated: ${id} (${subcategory.name})`);
                return subcategoryDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating subcategory ${id}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to update subcategory", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteSubcategory = async (id) => {
            try {
                logger_1.default.debug(`Deleting subcategory: ${id}`);
                await this._skillsRepository.deleteManySkillsBySubcategoryId(id);
                logger_1.default.info(`Deleted skills for subcategory: ${id}`);
                const subcategory = await this._subcategoryRepository.deleteSubcategory(id);
                if (!subcategory) {
                    logger_1.default.warn(`Subcategory not found for deletion: ${id}`);
                    throw new error_handler_1.ServiceError("Subcategory not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const subcategoryDTO = (0, subcategory_mapper_1.toSubcategoryDTO)(subcategory);
                if (!subcategoryDTO) {
                    logger_1.default.error(`Failed to map subcategory ${id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map subcategory to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Subcategory deleted: ${id} (${subcategory.name})`);
                return subcategoryDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting subcategory ${id}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to delete subcategory and related data", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._subcategoryRepository = subcategoryRepository;
        this._skillsRepository = skillsRepository;
    }
};
exports.SubcategoryService = SubcategoryService;
exports.SubcategoryService = SubcategoryService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('ISubCategoryRepository')),
    __param(1, (0, inversify_1.inject)('ISkillsRepository')),
    __metadata("design:paramtypes", [Object, Object])
], SubcategoryService);
//# sourceMappingURL=sub-category-service.js.map