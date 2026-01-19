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
exports.SkillsRepository = void 0;
const inversify_1 = require("inversify");
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const skills_model_1 = require("../Models/skills-model");
const status_code_enums_1 = require("../enums/status-code-enums");
const mongoose_1 = require("mongoose");
let SkillsRepository = class SkillsRepository extends base_repositry_1.BaseRepository {
    constructor() {
        super(skills_model_1.Skill);
        this.createSkill = async (data) => {
            try {
                logger_1.default.debug(`Creating skill: ${data.name} for subcategory ${data.subcategoryId}`);
                const skill = await this.create(data);
                logger_1.default.info(`Skill created: ${skill._id} (${skill.name})`);
                return skill;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating skill ${data.name}`, err);
                throw new error_handler_1.RepositoryError('Error creating skill', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllSkills = async (subcategoryId, query = {}) => {
            try {
                logger_1.default.debug(`Fetching skills for subcategory: ${subcategoryId} with query: ${JSON.stringify(query)}`);
                const { search, page = 1, limit = 10 } = query;
                const matchStage = {
                    subcategoryId: new mongoose_1.Types.ObjectId(subcategoryId),
                };
                if (search) {
                    matchStage.name = { $regex: `${search}`, $options: "i" };
                }
                const pipeline = [
                    { $match: matchStage },
                    {
                        $project: {
                            _id: 1,
                            skillId: 1,
                            name: 1,
                            description: 1,
                            imageUrl: 1,
                            categoryId: 1,
                            subcategoryId: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        },
                    },
                    {
                        $facet: {
                            skills: [
                                { $skip: (page - 1) * limit },
                                { $limit: limit },
                            ],
                            total: [{ $count: "count" }],
                        },
                    },
                ];
                const result = await this.model.aggregate(pipeline).exec();
                const skills = result[0]?.skills || [];
                const total = result[0]?.total[0]?.count || 0;
                logger_1.default.info(`Fetched ${skills.length} skills (total: ${total})`);
                return { skills, total };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching skills`, err);
                throw new error_handler_1.RepositoryError("Failed to fetch skills", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getSkillById = async (id) => {
            try {
                logger_1.default.debug(`Fetching skill by ID: ${id}`);
                const skill = await this.model
                    .findById(id)
                    .populate("categoryId")
                    .populate("subcategoryId")
                    .exec();
                if (!skill) {
                    logger_1.default.warn(`Skill not found: ${id}`);
                    throw new error_handler_1.RepositoryError(`Skill not found with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                else {
                    logger_1.default.info(`Skill fetched: ${id} (${skill.name})`);
                }
                return skill;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching skill by ID ${id}`, err);
                throw new error_handler_1.RepositoryError('Error fetching skill by ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateSkill = async (id, data) => {
            try {
                logger_1.default.debug(`Updating skill: ${id}`);
                const skill = await this.findByIdAndUpdate(id, data, { new: true });
                if (!skill) {
                    logger_1.default.warn(`Skill not found: ${id}`);
                    throw new error_handler_1.RepositoryError(`Skill not found with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                else {
                    logger_1.default.info(`Skill updated: ${id} (${skill.name})`);
                }
                return skill;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating skill ${id}`, err);
                throw new error_handler_1.RepositoryError('Error updating skill', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteSkill = async (id) => {
            try {
                logger_1.default.debug(`Deleting skill: ${id}`);
                const skill = await this.findByIdAndDelete(id);
                if (!skill) {
                    logger_1.default.warn(`Skill not found: ${id}`);
                    throw new error_handler_1.RepositoryError(`Skill not found with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                else {
                    logger_1.default.info(`Skill deleted: ${id} (${skill.name})`);
                }
                return skill;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting skill ${id}`, err);
                throw new error_handler_1.RepositoryError('Error deleting skill', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteManySkills = async (categoryId) => {
            try {
                logger_1.default.debug(`Deleting skills for category: ${categoryId}`);
                const result = await this.model.deleteMany({ categoryId }).exec();
                logger_1.default.info(`Deleted ${result.deletedCount} skills for category ${categoryId}`);
                return result;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting skills for category ${categoryId}`, err);
                throw new error_handler_1.RepositoryError('Error deleting skills', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteManySkillsBySubcategoryId = async (subcategoryId) => {
            try {
                logger_1.default.debug(`Deleting skills for subcategory: ${subcategoryId}`);
                const result = await this.model.deleteMany({ subcategoryId }).exec();
                logger_1.default.info(`Deleted ${result.deletedCount} skills for subcategory ${subcategoryId}`);
                return result;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting skills for subcategory ${subcategoryId}`, err);
                throw new error_handler_1.RepositoryError('Error deleting skills', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getSkills = async () => {
            try {
                logger_1.default.debug("Fetching all skills (name and ID only)");
                const skills = await this.model
                    .find({}, { name: 1, _id: 1 })
                    .lean()
                    .exec();
                const result = skills.map((skill) => ({
                    _id: skill._id.toString(),
                    name: skill.name,
                }));
                logger_1.default.info(`Fetched ${result.length} skills`);
                return result;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching skills`, err);
                throw new error_handler_1.RepositoryError('Error fetching skills', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.isDuplicateSkill = async (name, subcategoryId, excludeId) => {
            try {
                logger_1.default.debug(`Checking duplicate skill: ${name} for subcategory: ${subcategoryId}${excludeId ? `, excluding ID: ${excludeId}` : ''}`);
                const query = { name, subcategoryId };
                if (excludeId) {
                    query._id = { $ne: excludeId };
                }
                const existingSkill = await this.model.findOne(query).exec();
                const isDuplicate = !!existingSkill;
                logger_1.default.info(`Duplicate check for skill ${name} in subcategory ${subcategoryId} - ${isDuplicate}`);
                return isDuplicate;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error checking duplicate skill ${name} for subcategory ${subcategoryId}`, err);
                throw new error_handler_1.RepositoryError('Error checking duplicate skill', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
    }
};
exports.SkillsRepository = SkillsRepository;
exports.SkillsRepository = SkillsRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], SkillsRepository);
//# sourceMappingURL=skills-repository.js.map