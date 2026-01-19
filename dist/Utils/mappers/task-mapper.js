"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTaskDTO = toTaskDTO;
exports.toTaskDTOs = toTaskDTOs;
const user_mapper_1 = require("./user-mapper");
const group_mapper_1 = require("./group-mapper");
const logger_1 = __importDefault(require("../../core/utils/logger"));
const mongoose_1 = require("mongoose");
const collaboration_mapper_1 = require("./collaboration-mapper");
function toTaskDTO(task) {
    if (!task) {
        logger_1.default.warn('Attempted to map null task to DTO');
        return null;
    }
    //createdBy (populated IUser or just an ID)
    let createdBy;
    let createdByDetails;
    if (task.createdBy) {
        if (typeof task.createdBy === 'string') {
            createdBy = task.createdBy;
        }
        else if (task.createdBy instanceof mongoose_1.Types.ObjectId) {
            createdBy = task.createdBy.toString();
        }
        else {
            createdBy = task.createdBy._id.toString();
            const userDTO = (0, user_mapper_1.toUserDTO)(task.createdBy);
            createdByDetails = userDTO ?? undefined;
        }
    }
    else {
        logger_1.default.warn(`Task ${task._id} has no createdBy`);
        createdBy = '';
    }
    //assignedUsers (array of IDs or populated IUser objects)
    const assignedUsers = task.assignedUsers
        ? task.assignedUsers.map((user) => typeof user === 'string'
            ? user
            : user instanceof mongoose_1.Types.ObjectId
                ? user.toString()
                : user._id.toString())
        : [];
    const assignedUsersDetails = task.assignedUsers
        ? task.assignedUsers
            .map((user) => typeof user === 'string' || user instanceof mongoose_1.Types.ObjectId
            ? null
            : (0, user_mapper_1.toUserDTO)(user))
            .filter((dto) => dto !== null)
        : undefined;
    //contextId (populated IUser, IGroup, ICollaboration or just an ID)
    let contextId;
    let context;
    if (task.contextId) {
        if (typeof task.contextId === 'string') {
            contextId = task.contextId;
        }
        else if (task.contextId instanceof mongoose_1.Types.ObjectId) {
            contextId = task.contextId.toString();
        }
        else {
            contextId = task.contextId._id.toString();
            if (task.contextType === 'user') {
                const userDTO = (0, user_mapper_1.toUserDTO)(task.contextId);
                context = userDTO ?? undefined;
            }
            else if (task.contextType === 'group') {
                const groupDTO = (0, group_mapper_1.toGroupDTO)(task.contextId);
                context = groupDTO ?? undefined;
            }
            else if (task.contextType === 'collaboration') {
                const collaborationDTO = (0, collaboration_mapper_1.toCollaborationDTO)(task.contextId);
                context = collaborationDTO ?? undefined;
            }
        }
    }
    else {
        logger_1.default.warn(`Task ${task._id} has no contextId`);
        contextId = '';
    }
    return {
        id: task._id.toString(),
        taskId: task.taskId,
        name: task.name,
        description: task.description,
        image: task.image,
        priority: task.priority,
        status: task.status,
        startDate: task.startDate,
        dueDate: task.dueDate,
        notificationDate: task.notificationDate,
        notificationTime: task.notificationTime,
        contextType: task.contextType,
        contextId,
        context,
        assignedUsers,
        assignedUsersDetails: assignedUsersDetails?.length ? assignedUsersDetails : undefined,
        createdBy,
        createdByDetails,
        createdAt: task.createdAt,
    };
}
function toTaskDTOs(tasks) {
    return tasks
        .map(toTaskDTO)
        .filter((dto) => dto !== null);
}
//# sourceMappingURL=task-mapper.js.map