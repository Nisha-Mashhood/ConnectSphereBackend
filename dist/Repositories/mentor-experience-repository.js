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
exports.MentorExperienceRepository = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const mentor_experience_model_1 = __importDefault(require("../Models/mentor-experience-model"));
const status_code_enums_1 = require("../enums/status-code-enums");
let MentorExperienceRepository = class MentorExperienceRepository extends base_repositry_1.BaseRepository {
    constructor() {
        super(mentor_experience_model_1.default);
        this.toObjectId = (id) => {
            if (!id) {
                logger_1.default.warn("Missing ID when converting to ObjectId");
                throw new error_handler_1.RepositoryError("Invalid ID: ID is required", status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            let idStr;
            if (typeof id === "string") {
                idStr = id;
            }
            else if (id instanceof mongoose_1.Types.ObjectId) {
                idStr = id.toString();
            }
            else {
                logger_1.default.warn(`Invalid ID type: ${typeof id}`);
                throw new error_handler_1.RepositoryError("Invalid ID: must be a string or ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            if (!mongoose_1.Types.ObjectId.isValid(idStr)) {
                logger_1.default.warn(`Invalid ObjectId format: ${idStr}`);
                throw new error_handler_1.RepositoryError("Invalid ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            return new mongoose_1.Types.ObjectId(idStr);
        };
    }
    async createOne(data, options) {
        try {
            logger_1.default.debug(`Creating mentor experience for mentorId: ${data.mentorId}`);
            const experience = await this.create({
                ...data,
                mentorId: this.toObjectId(data.mentorId),
            }, options?.session);
            logger_1.default.info(`Mentor experience created: ${experience._id}`);
            return experience;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger_1.default.error(`Error creating mentor experience for mentorId ${data.mentorId}`, err);
            throw new error_handler_1.RepositoryError("Failed to create mentor experience", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
        }
    }
    async findByMentorId(mentorId) {
        try {
            logger_1.default.debug(`Fetching all experiences for mentorId: ${mentorId}`);
            const experiences = await this.model
                .find({ mentorId: this.toObjectId(mentorId) })
                .sort({ startDate: -1 })
                .exec();
            logger_1.default.info(`Found ${experiences.length} experiences for mentorId: ${mentorId}`);
            return experiences;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger_1.default.error(`Error fetching experiences for mentorId ${mentorId}`, err);
            throw new error_handler_1.RepositoryError("Failed to find mentor experiences", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
        }
    }
    async updateById(id, data) {
        try {
            logger_1.default.debug(`Updating mentor experience: ${id}`);
            const updated = await this.update(this.toObjectId(id).toString(), data);
            if (!updated) {
                logger_1.default.warn(`Mentor experience not found: ${id}`);
                throw new error_handler_1.RepositoryError(`Mentor experience not found with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
            }
            logger_1.default.info(`Mentor experience updated: ${id}`);
            return updated;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger_1.default.error(`Error updating mentor experience ${id}`, err);
            throw new error_handler_1.RepositoryError("Failed to update mentor experience", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
        }
    }
    async updateMany(filter, data) {
        try {
            logger_1.default.debug(`Updating multiple mentor experiences with filter: ${JSON.stringify(filter)}`);
            const result = await this.model.updateMany(filter, data).exec();
            logger_1.default.info(`Updated ${result.modifiedCount} mentor experiences`);
            return result.modifiedCount ?? 0;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger_1.default.error("Error updating multiple mentor experiences", err);
            throw new error_handler_1.RepositoryError("Failed to update mentor experiences", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
        }
    }
    async deleteById(id) {
        try {
            logger_1.default.debug(`Deleting mentor experience: ${id}`);
            const deleted = await this.delete(this.toObjectId(id).toString());
            if (!deleted) {
                logger_1.default.warn(`Mentor experience not found for deletion: ${id}`);
            }
            logger_1.default.info(`Mentor experience deleted: ${id}`);
            return deleted;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger_1.default.error(`Error deleting mentor experience ${id}`, err);
            throw new error_handler_1.RepositoryError("Failed to delete mentor experience", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
        }
    }
};
exports.MentorExperienceRepository = MentorExperienceRepository;
exports.MentorExperienceRepository = MentorExperienceRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], MentorExperienceRepository);
//# sourceMappingURL=mentor-experience-repository.js.map