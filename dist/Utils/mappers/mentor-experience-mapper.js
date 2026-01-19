"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMentorExperienceDTO = toMentorExperienceDTO;
exports.toMentorExperienceDTOs = toMentorExperienceDTOs;
const mongoose_1 = require("mongoose");
const logger_1 = __importDefault(require("../../core/utils/logger"));
function toMentorExperienceDTO(experience) {
    if (!experience) {
        logger_1.default.warn('Attempted to map null mentor experience to DTO');
        return null;
    }
    if (!experience._id) {
        logger_1.default.error(`Mentor experience has no _id: ${JSON.stringify(experience)}`);
        return null;
    }
    const id = experience._id.toString();
    const dto = {
        id,
        mentorExperienceId: experience.mentorExperienceId,
        mentorId: experience.mentorId instanceof mongoose_1.Types.ObjectId
            ? experience.mentorId.toString()
            : experience.mentorId,
        role: experience.role,
        organization: experience.organization,
        startDate: experience.startDate,
        endDate: experience.endDate || null,
        isCurrent: experience.isCurrent,
        description: experience.description || null,
        createdAt: experience.createdAt || new Date(),
        updatedAt: experience.updatedAt || new Date(),
    };
    logger_1.default.debug(`Mapped mentor experience DTO: ${id}`);
    return dto;
}
function toMentorExperienceDTOs(experiences) {
    logger_1.default.debug(`Mapping ${experiences.length} mentor experiences to DTOs`);
    const dtos = experiences
        .map((exp, index) => {
        logger_1.default.debug(`Processing experience at index ${index}`);
        const dto = toMentorExperienceDTO(exp);
        if (!dto) {
            logger_1.default.warn(`Skipping null DTO for experience at index ${index}`);
        }
        return dto;
    })
        .filter((dto) => dto !== null);
    logger_1.default.info(`Successfully mapped ${dtos.length} mentor experience DTOs`);
    return dtos;
}
//# sourceMappingURL=mentor-experience-mapper.js.map