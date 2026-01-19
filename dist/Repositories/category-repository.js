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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const inversify_1 = require("inversify");
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const category_model_1 = require("../Models/category-model");
const status_code_enums_1 = require("../enums/status-code-enums");
const error_messages_1 = require("../constants/error-messages");
let CategoryRepository = class CategoryRepository extends base_repositry_1.BaseRepository {
    constructor() {
        super(category_model_1.Category);
        this.createCategory = async (data) => {
            try {
                logger_1.default.debug(`Creating category: ${data.name}`);
                const category = await this.create(data);
                logger_1.default.info(`Category created: ${category._id} (${category.name})`);
                return category;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating category`, err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_CREATE_CATEGORY, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllCategories = async (query = {}) => {
            try {
                logger_1.default.debug(`Fetching all categories with query: ${JSON.stringify(query)}`);
                const { search, page = 1, limit = 10 } = query;
                if (!search) {
                    const categories = await this.model
                        .find()
                        .sort({ createdAt: -1 })
                        .exec();
                    logger_1.default.info(`Fetched ${JSON.stringify(categories)} categories`);
                    return { categories, total: categories.length };
                }
                const matchStage = {};
                if (search) {
                    matchStage.name = { $regex: `${search}`, $options: "i" };
                }
                const pipeline = [
                    { $match: matchStage },
                    {
                        $project: {
                            _id: 1,
                            categoryId: 1,
                            name: 1,
                            description: 1,
                            imageUrl: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        },
                    },
                    {
                        $facet: {
                            categories: [{ $skip: (page - 1) * limit }, { $limit: limit }],
                            total: [{ $count: "count" }],
                        },
                    },
                ];
                const result = await this.model.aggregate(pipeline).exec();
                const categories = result[0]?.categories || [];
                const total = result[0]?.total[0]?.count || 0;
                logger_1.default.info(`Fetched categories with total ${total}`);
                return { categories, total };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching categories`, err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_FETCH_CATEGORIES, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.fetchAllCategories = async () => {
            try {
                logger_1.default.debug(`Fetching all categories`);
                const categories = await this.model
                    .find()
                    .sort({ createdAt: -1 })
                    .exec();
                logger_1.default.info(`Fetched ${JSON.stringify(categories)} categories`);
                return { categories };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching categories`, err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_FETCH_CATEGORIES, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getCategoryById = async (id) => {
            try {
                logger_1.default.debug(`Fetching category by ID: ${id}`);
                const category = await this.findById(id);
                if (!category) {
                    logger_1.default.warn(`Category not found: ${id}`);
                    throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.CATEGORY_NOT_FOUND} with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Category fetched: ${id} (${category.name})`);
                return category;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching category by ID ${id}`, err);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_FETCH_CATEGORY_BY_ID} ${id}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateCategory = async (id, data) => {
            try {
                logger_1.default.debug(`Updating category: ${id}`);
                const category = await this.findByIdAndUpdate(id, data, { new: true });
                if (!category) {
                    logger_1.default.warn(`Category not found for update: ${id}`);
                    throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.CATEGORY_NOT_FOUND} for update: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Category updated: ${id} (${category.name})`);
                return category;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating category ${id}`, err);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_UPDATE_CATEGORY} ${id}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteCategory = async (id) => {
            try {
                logger_1.default.debug(`Deleting category: ${id}`);
                const category = await this.findByIdAndDelete(id);
                if (!category) {
                    logger_1.default.warn(`Category not found for deletion: ${id}`);
                    throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.CATEGORY_NOT_FOUND} for deletion: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Category deleted: ${id} (${category.name})`);
                return category;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting category ${id}`, err);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_DELETE_CATEGORY} ${id}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.isDuplicateCategoryName = async (name, excludeId) => {
            try {
                logger_1.default.debug(`Checking duplicate category name: ${name}`);
                const filter = { name };
                if (excludeId) {
                    filter._id = { $ne: excludeId };
                }
                const existingCategory = await this.findOne(filter);
                const isDuplicate = !!existingCategory;
                logger_1.default.info(`Duplicate check for category name ${name}: ${isDuplicate}`);
                return isDuplicate;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error checking duplicate category name ${name}`, err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_CHECK_DUPLICATE_CATEGORY, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
    }
};
exports.CategoryRepository = CategoryRepository;
exports.CategoryRepository = CategoryRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], CategoryRepository);
//# sourceMappingURL=category-repository.js.map