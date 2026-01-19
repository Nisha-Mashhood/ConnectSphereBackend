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
exports.SkillsService = void 0;
const inversify_1 = require("inversify");
const logger_1 = __importDefault(require("../core/utils/logger"));
const cloudinary_1 = require("../core/utils/cloudinary");
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const skill_mapper_1 = require("../Utils/mappers/skill-mapper");
let SkillsService = class SkillsService {
    constructor(skillRepository) {
        this.createSkill = async (data, imagePath, fileSize) => {
            try {
                logger_1.default.debug(`Creating skill: ${data.name} for subcategory ${data.subcategoryId}`);
                if (!data.name || !data.subcategoryId) {
                    logger_1.default.error("Missing required fields: name or subcategoryId");
                    throw new error_handler_1.ServiceError("Skill name and subcategory ID are required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const isDuplicate = await this._skillsRepository.isDuplicateSkill(data.name, data.subcategoryId.toString());
                if (isDuplicate) {
                    logger_1.default.warn(`Skill name '${data.name}' already exists in subcategory ${data.subcategoryId}`);
                    throw new error_handler_1.ServiceError("Skill name already exists in this subcategory", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                let imageUrl = null;
                if (imagePath) {
                    const folder = "skills";
                    const { url } = await (0, cloudinary_1.uploadMedia)(imagePath, folder, fileSize);
                    imageUrl = url;
                    logger_1.default.info(`Uploaded image for skill: ${imageUrl}`);
                }
                const skill = await this._skillsRepository.createSkill({ ...data, imageUrl });
                const skillDTO = (0, skill_mapper_1.toSkillDTO)(skill);
                if (!skillDTO) {
                    logger_1.default.error(`Failed to map skill ${skill._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map skill to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Skill created: ${skill._id} (${skill.name})`);
                return skillDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating skill ${data.name}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to create skill", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllSkills = async (subcategoryId, query = {}) => {
            try {
                logger_1.default.debug(`Service: Fetching skills for subcategory: ${subcategoryId}`);
                const result = await this._skillsRepository.getAllSkills(subcategoryId, query);
                const skillsDTO = (0, skill_mapper_1.toSkillDTOs)(result.skills);
                return { skills: skillsDTO, total: result.total };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error in SkillService: ${err.message}`);
                throw new error_handler_1.ServiceError("Failed to fetch skills", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getSkillById = async (id) => {
            try {
                logger_1.default.debug(`Fetching skill: ${id}`);
                const skill = await this._skillsRepository.getSkillById(id);
                if (!skill) {
                    logger_1.default.warn(`Skill not found: ${id}`);
                    throw new error_handler_1.ServiceError("Skill not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const skillDTO = (0, skill_mapper_1.toSkillDTO)(skill);
                if (!skillDTO) {
                    logger_1.default.error(`Failed to map skill ${id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map skill to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Skill fetched: ${id} (${skill.name})`);
                return skillDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching skill ${id}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch skill", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateSkill = async (id, data, imagePath, fileSize) => {
            try {
                logger_1.default.debug(`Updating skill: ${id}`);
                if (data.name) {
                    const existingSkill = await this._skillsRepository.getSkillById(id);
                    if (!existingSkill) {
                        logger_1.default.warn(`Skill not found for update: ${id}`);
                        throw new error_handler_1.ServiceError("Skill not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                    }
                    const isDuplicate = await this._skillsRepository.isDuplicateSkill(data.name, existingSkill.subcategoryId._id.toString(), id);
                    if (isDuplicate) {
                        logger_1.default.warn(`Skill name '${data.name}' already exists in subcategory ${existingSkill.subcategoryId}`);
                        throw new error_handler_1.ServiceError("Skill name already exists in this subcategory", status_code_enums_1.StatusCodes.BAD_REQUEST);
                    }
                }
                let imageUrl = null;
                if (imagePath) {
                    const folder = "skills";
                    const { url } = await (0, cloudinary_1.uploadMedia)(imagePath, folder, fileSize);
                    imageUrl = url;
                    logger_1.default.info(`Uploaded image for skill: ${imageUrl}`);
                }
                const skill = await this._skillsRepository.updateSkill(id, { ...data, ...(imageUrl && { imageUrl }) });
                if (!skill) {
                    logger_1.default.warn(`Skill not found for update: ${id}`);
                    throw new error_handler_1.ServiceError("Skill not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const skillDTO = (0, skill_mapper_1.toSkillDTO)(skill);
                if (!skillDTO) {
                    logger_1.default.error(`Failed to map skill ${id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map skill to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Skill updated: ${id} (${skill.name})`);
                return skillDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating skill ${id}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to update skill", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteSkill = async (id) => {
            try {
                logger_1.default.debug(`Deleting skill: ${id}`);
                const skill = await this._skillsRepository.deleteSkill(id);
                if (!skill) {
                    logger_1.default.warn(`Skill not found for deletion: ${id}`);
                    throw new error_handler_1.ServiceError("Skill not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const skillDTO = (0, skill_mapper_1.toSkillDTO)(skill);
                if (!skillDTO) {
                    logger_1.default.error(`Failed to map skill ${id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map skill to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Skill deleted: ${id} (${skill.name})`);
                return skillDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting skill ${id}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to delete skill", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getSkills = async () => {
            try {
                logger_1.default.debug("Fetching all skills (name and ID only)");
                const skills = await this._skillsRepository.getSkills();
                logger_1.default.info(`Fetched ${skills.length} skills`);
                return skills;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching skills: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch skills", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._skillsRepository = skillRepository;
    }
};
exports.SkillsService = SkillsService;
exports.SkillsService = SkillsService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('ISkillsRepository')),
    __metadata("design:paramtypes", [Object])
], SkillsService);
//# sourceMappingURL=skill-service.js.map