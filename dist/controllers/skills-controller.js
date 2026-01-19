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
exports.SkillsController = void 0;
const inversify_1 = require("inversify");
const base_controller_1 = require("../core/controller/base-controller");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const messages_1 = require("../constants/messages");
const error_messages_1 = require("../constants/error-messages");
const status_code_enums_1 = require("../enums/status-code-enums");
let SkillsController = class SkillsController extends base_controller_1.BaseController {
    constructor(skillService) {
        super();
        this.createSkill = async (req, res, next) => {
            try {
                logger_1.default.debug(`Creating skill: ${req.body.name}`);
                const imagePath = req.file?.path;
                const fileSize = req.file?.size;
                const skill = await this._skillsService.createSkill(req.body, imagePath, fileSize);
                this.sendCreated(res, skill, messages_1.SKILL_MESSAGES.SKILL_CREATED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllSkills = async (req, res, next) => {
            try {
                const { subcategoryId } = req.params;
                const { search, page, limit } = req.query;
                const query = {};
                if (search)
                    query.search = search;
                if (page)
                    query.page = parseInt(page, 10);
                if (limit)
                    query.limit = parseInt(limit, 10);
                const result = await this._skillsService.getAllSkills(subcategoryId, query);
                if (result.skills.length === 0) {
                    this.sendSuccess(res, { skills: [], total: 0, page: query.page || 1, limit: query.limit || 10 }, query.search
                        ? messages_1.SKILL_MESSAGES.NO_SKILLS_FOUND
                        : messages_1.SKILL_MESSAGES.NO_SKILLS_FOUND_FOR_SUBCATEGORY);
                    return;
                }
                this.sendSuccess(res, {
                    skills: result.skills,
                    total: result.total,
                    page: query.page || 1,
                    limit: query.limit || 10,
                }, messages_1.SKILL_MESSAGES.SKILLS_FETCHED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getSkillById = async (req, res, next) => {
            try {
                logger_1.default.debug(`Fetching skill: ${req.params.id}`);
                const skill = await this._skillsService.getSkillById(req.params.id);
                if (!skill) {
                    this.sendSuccess(res, "", messages_1.SKILL_MESSAGES.NO_SKILLS_FOUND);
                    logger_1.default.info("No skills found");
                    return;
                }
                this.sendSuccess(res, skill, messages_1.SKILL_MESSAGES.SKILL_FETCHED);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateSkill = async (req, res, next) => {
            try {
                logger_1.default.debug(`Updating skill: ${req.params.id}`);
                const imagePath = req.file?.path;
                const fileSize = req.file?.size;
                const updatedSkill = await this._skillsService.updateSkill(req.params.id, req.body, imagePath, fileSize);
                if (!updatedSkill) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.SKILL_NOT_FOUND, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                this.sendSuccess(res, updatedSkill, messages_1.SKILL_MESSAGES.SKILL_UPDATED);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteSkill = async (req, res, next) => {
            try {
                logger_1.default.debug(`Deleting skill: ${req.params.id}`);
                const deletedSkill = await this._skillsService.deleteSkill(req.params.id);
                if (!deletedSkill) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.SKILL_NOT_FOUND, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                this.sendNoContent(res, messages_1.SKILL_MESSAGES.SKILL_DELETED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getSkills = async (_req, res, next) => {
            try {
                logger_1.default.debug("Fetching all skills (name and ID only)");
                const skills = await this._skillsService.getSkills();
                if (skills.length === 0) {
                    this.sendSuccess(res, [], messages_1.SKILL_MESSAGES.NO_SKILLS_FOUND);
                    logger_1.default.info("No skills found");
                    return;
                }
                this.sendSuccess(res, skills, messages_1.SKILL_MESSAGES.SKILLS_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error fetching skills: ${error}`);
                next(error);
            }
        };
        this._skillsService = skillService;
    }
};
exports.SkillsController = SkillsController;
exports.SkillsController = SkillsController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('ISkillsService')),
    __metadata("design:paramtypes", [Object])
], SkillsController);
//# sourceMappingURL=skills-controller.js.map