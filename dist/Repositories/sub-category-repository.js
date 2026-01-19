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
exports.SubcategoryRepository = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const sub_category_model_1 = require("../Models/sub-category-model");
const status_code_enums_1 = require("../enums/status-code-enums");
let SubcategoryRepository = class SubcategoryRepository extends base_repositry_1.BaseRepository {
    constructor() {
        super(sub_category_model_1.Subcategory);
        this.createSubcategory = async (data) => {
            try {
                logger_1.default.debug(`Creating subcategory: ${data.name} for category ${data.categoryId}`);
                const subcategory = await this.create(data);
                logger_1.default.info(`Subcategory created: ${subcategory._id} (${subcategory.name})`);
                return subcategory;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating subcategory ${data.name}`, err);
                throw new error_handler_1.RepositoryError('Error creating subcategory', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllSubcategories = async (categoryId, query) => {
            try {
                logger_1.default.debug(`Fetching subcategories for category: ${categoryId} with query: ${JSON.stringify(query)}`);
                const { search, page = 1, limit = 10 } = query;
                const matchStage = {
                    categoryId: new mongoose_1.Types.ObjectId(categoryId),
                };
                if (search) {
                    matchStage.name = { $regex: `${search}`, $options: "i" };
                }
                const pipeline = [
                    { $match: matchStage },
                    {
                        $project: {
                            _id: 1,
                            subcategoryId: 1,
                            name: 1,
                            description: 1,
                            imageUrl: 1,
                            categoryId: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        },
                    },
                    {
                        $facet: {
                            subcategories: [
                                { $skip: (page - 1) * limit },
                                { $limit: limit },
                            ],
                            total: [{ $count: "count" }],
                        },
                    },
                ];
                const result = await this.model.aggregate(pipeline).exec();
                const subcategories = result[0]?.subcategories || [];
                const total = result[0]?.total[0]?.count || 0;
                logger_1.default.info(`Fetched ${subcategories.length} subcategories (total: ${total})`);
                return { subcategories, total };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching subcategories`, err);
                throw new error_handler_1.RepositoryError("Failed to fetch subcategories", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getSubcategoryById = async (id) => {
            try {
                logger_1.default.debug(`Fetching subcategory by ID: ${id}`);
                const subcategory = await this.model
                    .findById(id)
                    .populate("categoryId")
                    .exec();
                if (!subcategory) {
                    logger_1.default.warn(`Subcategory not not found: ${id}`);
                    throw new error_handler_1.RepositoryError(`Subcategory not found with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Subcategory fetched: ${id} (${subcategory.name})`);
                return subcategory;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching subcategory by ID ${id}`, err);
                throw new error_handler_1.RepositoryError('Error fetching subcategory by ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateSubcategory = async (id, data) => {
            try {
                logger_1.default.debug(`Updating subcategory: ${id}`);
                const subcategory = await this.findByIdAndUpdate(id, data, { new: true });
                if (!subcategory) {
                    logger_1.default.warn(`Subcategory not not found: ${id}`);
                    throw new error_handler_1.RepositoryError(`Subcategory not found with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Subcategory updated: ${id} (${subcategory.name})`);
                return subcategory;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating subcategory ${id}`, err);
                throw new error_handler_1.RepositoryError('Error updating subcategory', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteSubcategory = async (id) => {
            try {
                logger_1.default.debug(`Deleting subcategory: ${id}`);
                const subcategory = await this.findByIdAndDelete(id);
                if (!subcategory) {
                    logger_1.default.warn(`Subcategory not not found: ${id}`);
                    throw new error_handler_1.RepositoryError(`Subcategory not found with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Subcategory deleted: ${id} (${subcategory.name})`);
                return subcategory;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting subcategory ${id}`, err);
                throw new error_handler_1.RepositoryError('Error deleting subcategory', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteManySubcategories = async (categoryId) => {
            try {
                logger_1.default.debug(`Deleting subcategories for category: ${categoryId}`);
                const result = await this.model.deleteMany({ categoryId }).exec();
                logger_1.default.info(`Deleted ${result.deletedCount} subcategories for category ${categoryId}`);
                return result;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting subcategories for category ${categoryId}`, err);
                throw new error_handler_1.RepositoryError('Error deleting subcategories', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.isDuplicateSubcategory = async (name, categoryId, excludeId) => {
            try {
                logger_1.default.debug(`Checking duplicate subcategory: ${name} for category: ${categoryId}${excludeId ? `, excluding ID: ${excludeId}` : ''}`);
                const query = { name, categoryId };
                if (excludeId) {
                    query._id = { $ne: excludeId };
                }
                const existingSubcategory = await this.model.findOne(query).exec();
                const isDuplicate = !!existingSubcategory;
                logger_1.default.info(`Duplicate check for subcategory ${name} in category ${categoryId} - ${isDuplicate}`);
                return isDuplicate;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error checking duplicate subcategory ${name} for category ${categoryId}`, err);
                throw new error_handler_1.RepositoryError('Error checking duplicate subcategory', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
    }
};
exports.SubcategoryRepository = SubcategoryRepository;
exports.SubcategoryRepository = SubcategoryRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], SubcategoryRepository);
//# sourceMappingURL=sub-category-repository.js.map