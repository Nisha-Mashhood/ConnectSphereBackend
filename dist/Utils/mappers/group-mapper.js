"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toGroupDTO = toGroupDTO;
exports.toGroupDTOs = toGroupDTOs;
const logger_1 = __importDefault(require("../../core/utils/logger"));
const mongoose_1 = require("mongoose");
const user_mapper_1 = require("./user-mapper");
function toTimeSlotDTO(slot) {
    return {
        day: slot.day,
        timeSlots: slot.timeSlots,
    };
}
function toGroupDTO(group) {
    if (!group) {
        logger_1.default.warn('Attempted to map null group to DTO');
        return null;
    }
    // logger.debug(`Mapping group ${group._id}: ${JSON.stringify(group, null, 2)}`);
    // Handle adminId
    let adminId;
    let admin;
    if (group.adminId) {
        if (typeof group.adminId === 'string') {
            adminId = group.adminId;
        }
        else if (group.adminId instanceof mongoose_1.Types.ObjectId) {
            adminId = group.adminId.toString();
        }
        else {
            // Assume it's an IUser object (populated)
            adminId = group.adminId._id?.toString() || '';
            const adminDTO = (0, user_mapper_1.toUserDTO)(group.adminId);
            admin = adminDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Group ${group._id} has no adminId`);
        adminId = '';
    }
    const members = [];
    const membersDetails = [];
    if (Array.isArray(group.members) && group.members.length > 0) {
        group.members.forEach((member) => {
            // logger.debug(`Processing member for group ${group._id}: ${JSON.stringify(member, null, 2)}`);
            let memberUserId;
            let memberUser;
            if (member.userId) {
                if (typeof member.userId === 'string') {
                    memberUserId = member.userId;
                }
                else if (member.userId instanceof mongoose_1.Types.ObjectId) {
                    memberUserId = member.userId.toString();
                }
                else {
                    // Assume it's an IUser object (populated)
                    memberUserId = member.userId._id?.toString() || '';
                    const memberUserDTO = (0, user_mapper_1.toUserDTO)(member.userId);
                    memberUser = memberUserDTO ?? undefined;
                }
            }
            else {
                logger_1.default.warn(`Group ${group._id} has member with no userId`);
                memberUserId = '';
            }
            members.push({ userId: memberUserId, joinedAt: member.joinedAt || new Date() });
            if (memberUser) {
                membersDetails.push({ user: memberUser, joinedAt: member.joinedAt || new Date() });
            }
        });
    }
    else {
        logger_1.default.info(`Group ${group._id} has no members or members is not an array`);
    }
    return {
        id: group._id.toString(),
        groupId: group.groupId,
        name: group.name,
        bio: group.bio,
        price: group.price,
        maxMembers: group.maxMembers,
        isFull: group.isFull,
        availableSlots: group.availableSlots.map(toTimeSlotDTO),
        profilePic: group.profilePic,
        coverPic: group.coverPic,
        startDate: group.startDate,
        adminId,
        admin,
        members,
        membersDetails,
        createdAt: group.createdAt,
    };
}
function toGroupDTOs(groups) {
    return groups
        .map(toGroupDTO)
        .filter((dto) => dto !== null);
}
//# sourceMappingURL=group-mapper.js.map