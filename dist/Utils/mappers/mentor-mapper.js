"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMentorDTO = toMentorDTO;
exports.toMentorDTOs = toMentorDTOs;
const mongoose_1 = require("mongoose");
const user_mapper_1 = require("./user-mapper");
const skill_mapper_1 = require("./skill-mapper");
const logger_1 = __importDefault(require("../../core/utils/logger"));
function toMentorDTO(mentor) {
    if (!mentor) {
        logger_1.default.warn('Attempted to map null mentor to DTO');
        return null;
    }
    // Handle _id
    if (!mentor._id) {
        logger_1.default.error(`Mentor has no _id: ${JSON.stringify(mentor)}`);
        return null;
    }
    const id = mentor._id.toString();
    logger_1.default.debug(`Mentor ID: ${id}`);
    // Handle userId
    let userId = '';
    let user;
    if (!mentor.userId) {
        logger_1.default.warn(`Mentor ${id} has no userId`);
    }
    else if (typeof mentor.userId === 'string') {
        userId = mentor.userId;
        logger_1.default.debug(`Mentor ${id} userId is string: ${userId}`);
    }
    else if (mentor.userId instanceof mongoose_1.Types.ObjectId) {
        userId = mentor.userId.toString();
        logger_1.default.debug(`Mentor ${id} userId is ObjectId: ${userId}`);
    }
    else if (typeof mentor.userId === 'object' && '_id' in mentor.userId) {
        // Populated IUser object
        userId = mentor.userId._id.toString();
        logger_1.default.debug(`Mentor ${id} userId is populated, _id: ${userId}`);
        const userDTO = (0, user_mapper_1.toUserDTO)(mentor.userId);
        if (!userDTO) {
            logger_1.default.warn(`Failed to convert user to DTO for mentor ${id}`);
        }
        else {
            user = userDTO;
        }
    }
    else {
        logger_1.default.error(`Invalid userId format for mentor ${id}: ${JSON.stringify(mentor.userId)}`);
    }
    // Handle skills
    let skills = [];
    let skillsDetails = [];
    if (!mentor.skills) {
        logger_1.default.warn(`Mentor ${id} has no skills`);
    }
    else if (mentor.skills.every((skill) => typeof skill === "string" || skill instanceof mongoose_1.Types.ObjectId)) {
        // Non-populated skills: array of ObjectIds or strings
        skills = mentor.skills?.map((s) => typeof s === "string" ? s : s.toString());
        logger_1.default.debug(`Mentor ${id} has non-populated skills (IDs): ${skills.join(", ")}`);
    }
    else if (mentor.skills.every((skill) => typeof skill === "object" && skill !== null && "name" in skill)) {
        // Populated ISkill objects
        skillsDetails = (0, skill_mapper_1.toSkillDTOs)(mentor.skills);
        skills = skillsDetails.map((skill) => skill.name);
        logger_1.default.debug(`Mentor ${id} has populated skills: ${skills.join(", ")}`);
    }
    else {
        logger_1.default.error(`Invalid skills format for mentor ${id}: ${JSON.stringify(mentor.skills)}`);
    }
    const mentorDTO = {
        id,
        mentorId: mentor.mentorId,
        userId,
        user,
        isApproved: mentor.isApproved,
        rejectionReason: mentor.rejectionReason,
        skills,
        skillsDetails,
        certifications: mentor.certifications || [],
        specialization: mentor.specialization || '',
        bio: mentor.bio || '',
        price: mentor.price || 0,
        availableSlots: mentor.availableSlots || [],
        timePeriod: mentor.timePeriod,
        createdAt: mentor.createdAt,
        updatedAt: mentor.updatedAt,
    };
    // logger.debug(`Mentor DTO created for ${id}: ${JSON.stringify(mentorDTO, null, 2)}`);
    return mentorDTO;
}
function toMentorDTOs(mentors) {
    logger_1.default.debug(`Mapping ${mentors.length} mentors to DTOs`);
    const dtos = mentors
        .map((mentor, index) => {
        logger_1.default.debug(`Processing mentor at index ${index}`);
        const dto = toMentorDTO(mentor);
        if (!dto) {
            logger_1.default.warn(`Skipping null DTO for mentor at index ${index}`);
        }
        return dto;
    })
        .filter((dto) => dto !== null);
    logger_1.default.info(`Successfully mapped ${dtos.length} mentor DTOs`);
    return dtos;
}
//# sourceMappingURL=mentor-mapper.js.map