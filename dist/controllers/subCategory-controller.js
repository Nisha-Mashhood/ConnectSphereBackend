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
exports.SubcategoryController = void 0;
const inversify_1 = require("inversify");
const base_controller_1 = require("../core/controller/base-controller");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const messages_1 = require("../constants/messages");
const error_messages_1 = require("../constants/error-messages");
const status_code_enums_1 = require("../enums/status-code-enums");
let SubcategoryController = class SubcategoryController extends base_controller_1.BaseController {
    constructor(subCategoryService) {
        super();
        this.createSubcategory = async (req, res, next) => {
            try {
                logger_1.default.debug(`Creating subcategory: ${req.body.name}`);
                const imagePath = req.file?.path;
                const fileSize = req.file?.size;
                const subcategory = await this._subcategoryService.createSubcategory(req.body, imagePath, fileSize);
                this.sendCreated(res, subcategory, messages_1.SUBCATEGORY_MESSAGES.SUBCATEGORY_CREATED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllSubcategories = async (req, res, next) => {
            logger_1.default.debug(`Fetching subcategories for category: ${req.params.categoryId}`);
            try {
                const { categoryId } = req.params;
                const { search, page, limit } = req.query;
                const query = {};
                if (search)
                    query.search = search;
                if (page)
                    query.page = parseInt(page, 10);
                if (limit)
                    query.limit = parseInt(limit, 10);
                logger_1.default.debug(`Fetching sub-categories with query: ${JSON.stringify(query)}`);
                const result = await this._subcategoryService.getAllSubcategories(categoryId, query);
                if (!search) {
                    if (result.subcategories.length === 0) {
                        this.sendSuccess(res, { subcategories: [],
                            total: result.total,
                            page: query.page || 1,
                            limit: query.limit || 10,
                        }, messages_1.SUBCATEGORY_MESSAGES.NO_SUBCATEGORIES_FOUND);
                        logger_1.default.info("No sub-categories found");
                        return;
                    }
                    this.sendSuccess(res, {
                        subcategories: result.subcategories,
                        total: result.total,
                        page: query.page || 1,
                        limit: query.limit || 10,
                    }, messages_1.SUBCATEGORY_MESSAGES.SUBCATEGORIES_FETCHED);
                    logger_1.default.info(`Fetched ${result.subcategories.length} sub-categories`);
                    return;
                }
                if (result.subcategories.length === 0) {
                    this.sendSuccess(res, {
                        subcategories: [],
                        total: 0,
                        page: query.page || 1,
                        limit: query.limit || 10,
                    }, query.search ? messages_1.SUBCATEGORY_MESSAGES.NO_SUBCATEGORIES_FOUND : messages_1.SUBCATEGORY_MESSAGES.NO_SUBCATEGORIES_FOUND);
                    logger_1.default.info(`No categories found for query: ${JSON.stringify(query)}`);
                    return;
                }
                this.sendSuccess(res, {
                    subcategories: result.subcategories,
                    total: result.total,
                    page: query.page || 1,
                    limit: query.limit || 10,
                }, messages_1.SUBCATEGORY_MESSAGES.SUBCATEGORIES_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error fetching sub-categories: ${error}`);
                next(error);
            }
        };
        this.getSubcategoryById = async (req, res, next) => {
            try {
                logger_1.default.debug(`Fetching subcategory: ${req.params.id}`);
                const subcategory = await this._subcategoryService.getSubcategoryById(req.params.id);
                if (!subcategory) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.SUBCATEGORY_NOT_FOUND, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                this.sendSuccess(res, subcategory, messages_1.SUBCATEGORY_MESSAGES.SUBCATEGORY_FETCHED);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateSubcategory = async (req, res, next) => {
            try {
                logger_1.default.debug(`Updating subcategory: ${req.params.id}`);
                const imagePath = req.file?.path;
                const fileSize = req.file?.size;
                const updatedSubcategory = await this._subcategoryService.updateSubcategory(req.params.id, req.body, imagePath, fileSize);
                if (!updatedSubcategory) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.SUBCATEGORY_NOT_FOUND, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                this.sendSuccess(res, updatedSubcategory, messages_1.SUBCATEGORY_MESSAGES.SUBCATEGORY_UPDATED);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteSubcategory = async (req, res, next) => {
            try {
                logger_1.default.debug(`Deleting subcategory: ${req.params.id}`);
                const deletedSubcategory = await this._subcategoryService.deleteSubcategory(req.params.id);
                if (!deletedSubcategory) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.SUBCATEGORY_NOT_FOUND, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                this.sendNoContent(res, messages_1.SUBCATEGORY_MESSAGES.SUBCATEGORY_DELETED);
            }
            catch (error) {
                next(error);
            }
        };
        this._subcategoryService = subCategoryService;
    }
};
exports.SubcategoryController = SubcategoryController;
exports.SubcategoryController = SubcategoryController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('ISubCategoryService')),
    __metadata("design:paramtypes", [Object])
], SubcategoryController);
//# sourceMappingURL=subCategory-controller.js.map