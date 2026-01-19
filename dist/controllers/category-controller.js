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
exports.CategoryController = void 0;
const inversify_1 = require("inversify");
const base_controller_1 = require("../core/controller/base-controller");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const messages_1 = require("../constants/messages");
const error_messages_1 = require("../constants/error-messages");
let CategoryController = class CategoryController extends base_controller_1.BaseController {
    constructor(categoryService) {
        super();
        this.createCategory = async (req, res, next) => {
            try {
                logger_1.default.debug(`Creating category: ${req.body.name}`);
                if (!req.body.name) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_CATEGORY_NAME, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const isDuplicate = await this._categoryService.isDuplicateCategoryName(req.body.name);
                if (isDuplicate) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.DUPLICATE_CATEGORY_NAME, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const imagePath = req.file?.path;
                const fileSize = req.file?.size;
                const category = await this._categoryService.createCategory(req.body, imagePath, fileSize);
                this.sendCreated(res, category, messages_1.CATEGORY_MESSAGES.CATEGORY_CREATED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllCategories = async (req, res, next) => {
            try {
                const { search, page, limit } = req.query;
                const query = {};
                if (search)
                    query.search = search;
                if (page)
                    query.page = parseInt(page, 10);
                if (limit)
                    query.limit = parseInt(limit, 10);
                logger_1.default.debug(`Fetching categories with query: ${JSON.stringify(query)}`);
                const result = await this._categoryService.getAllCategories(query);
                if (!search) {
                    if (result.categories.length === 0) {
                        this.sendSuccess(res, { categories: [],
                            total: result.total,
                            page: query.page || 1,
                            limit: query.limit || 10,
                        }, messages_1.CATEGORY_MESSAGES.NO_CATEGORIES_FOUND);
                        logger_1.default.info("No categories found");
                        return;
                    }
                    this.sendSuccess(res, {
                        categories: result.categories,
                        total: result.total,
                        page: query.page || 1,
                        limit: query.limit || 10,
                    }, messages_1.CATEGORY_MESSAGES.CATEGORIES_FETCHED);
                    logger_1.default.info(`Fetched ${result.categories.length} categories`);
                    return;
                }
                if (result.categories.length === 0) {
                    this.sendSuccess(res, {
                        categories: [],
                        total: 0,
                        page: query.page || 1,
                        limit: query.limit || 10,
                    }, query.search ? messages_1.CATEGORY_MESSAGES.NO_CATEGORIES_FOUND_FOR_SEARCH : messages_1.CATEGORY_MESSAGES.NO_CATEGORIES_FOUND);
                    logger_1.default.info(`No categories found for query: ${JSON.stringify(query)}`);
                    return;
                }
                this.sendSuccess(res, {
                    categories: result.categories,
                    total: result.total,
                    page: query.page || 1,
                    limit: query.limit || 10,
                }, messages_1.CATEGORY_MESSAGES.CATEGORIES_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error fetching categories: ${error}`);
                next(error);
            }
        };
        this.fetchAllCategories = async (_req, res, next) => {
            try {
                const result = await this._categoryService.fetchAllCategories();
                if (result.categories.length === 0) {
                    this.sendSuccess(res, { categories: [] }, messages_1.CATEGORY_MESSAGES.NO_CATEGORIES_FOUND);
                    logger_1.default.info("No categories found");
                    return;
                }
                this.sendSuccess(res, { categories: result.categories }, messages_1.CATEGORY_MESSAGES.CATEGORIES_FETCHED);
                logger_1.default.info(`Fetched ${result.categories.length} categories`);
                return;
            }
            catch (error) {
                logger_1.default.error(`Error fetching categories: ${error}`);
                next(error);
            }
        };
        this.getCategoryById = async (req, res, next) => {
            try {
                logger_1.default.debug(`Fetching category: ${req.params.id}`);
                const category = await this._categoryService.getCategoryById(req.params.id);
                if (!category) {
                    this.sendSuccess(res, { category: null }, messages_1.CATEGORY_MESSAGES.NO_CATEGORY_FOUND);
                    logger_1.default.info(`No category found for ID: ${req.params.id}`);
                    return;
                }
                this.sendSuccess(res, category, messages_1.CATEGORY_MESSAGES.CATEGORY_FETCHED);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateCategory = async (req, res, next) => {
            try {
                logger_1.default.debug(`Updating category: ${req.params.id}`);
                if (!req.body.name) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_CATEGORY_NAME, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const isDuplicate = await this._categoryService.isDuplicateCategoryName(req.body.name, req.params.id);
                if (isDuplicate) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.DUPLICATE_CATEGORY_NAME, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const imagePath = req.file?.path;
                const fileSize = req.file?.size;
                const updatedCategory = await this._categoryService.updateCategory(req.params.id, req.body, imagePath, fileSize);
                if (!updatedCategory) {
                    this.sendSuccess(res, { updatedCategory: null }, messages_1.CATEGORY_MESSAGES.NO_CATEGORY_FOUND);
                    logger_1.default.info(`No category found for ID: ${req.params.id}`);
                    return;
                }
                this.sendSuccess(res, updatedCategory, messages_1.CATEGORY_MESSAGES.CATEGORY_UPDATED);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteCategory = async (req, res, next) => {
            try {
                logger_1.default.debug(`Deleting category: ${req.params.id}`);
                const deletedCategory = await this._categoryService.deleteCategory(req.params.id);
                if (!deletedCategory) {
                    this.sendSuccess(res, { deletedCategory: null }, messages_1.CATEGORY_MESSAGES.NO_CATEGORY_FOUND);
                    logger_1.default.info(`No category found for ID: ${req.params.id}`);
                    return;
                }
                this.sendNoContent(res, messages_1.CATEGORY_MESSAGES.CATEGORY_DELETED);
            }
            catch (error) {
                next(error);
            }
        };
        this._categoryService = categoryService;
    }
};
exports.CategoryController = CategoryController;
exports.CategoryController = CategoryController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('ICategoryService')),
    __metadata("design:paramtypes", [Object])
], CategoryController);
//# sourceMappingURL=category-controller.js.map