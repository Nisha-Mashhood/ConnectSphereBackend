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
exports.TaskRepository = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const task_model_1 = require("../Models/task-model");
const status_code_enums_1 = require("../enums/status-code-enums");
let TaskRepository = class TaskRepository extends base_repositry_1.BaseRepository {
    constructor() {
        super(task_model_1.Task);
        this.toObjectId = (id) => {
            if (!id) {
                logger_1.default.warn('Missing ID when converting to ObjectId');
                throw new error_handler_1.RepositoryError('Invalid ID: ID is required', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            const idStr = typeof id === 'string' ? id : id.toString();
            if (!mongoose_1.Types.ObjectId.isValid(idStr)) {
                logger_1.default.warn(`Invalid ObjectId format: ${idStr}`);
                throw new error_handler_1.RepositoryError('Invalid ID: must be a 24 character hex string', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            return new mongoose_1.Types.ObjectId(idStr);
        };
        this.createTask = async (taskData) => {
            try {
                logger_1.default.debug(`Creating task: ${taskData.name}`);
                const task = await this.create({
                    ...taskData,
                    contextId: taskData.contextId ? this.toObjectId(taskData.contextId) : undefined,
                    createdBy: taskData.createdBy ? this.toObjectId(taskData.createdBy) : undefined,
                    assignedUsers: taskData.assignedUsers
                        ? taskData.assignedUsers.map((id) => this.toObjectId(id))
                        : [],
                    createdAt: new Date(),
                });
                logger_1.default.info(`Task created: ${task._id} (${task.name})`);
                return task;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating task ${taskData.name}`, err);
                throw new error_handler_1.RepositoryError('Error creating task', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findTaskById = async (taskId) => {
            try {
                logger_1.default.debug(`Fetching task by ID: ${taskId}`);
                const task = await this.findById(taskId);
                if (!task) {
                    logger_1.default.warn(`Task not found: ${taskId}`);
                    throw new error_handler_1.RepositoryError(`Task not found with ID: ${taskId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Task fetched: ${taskId} (${task.name})`);
                return task;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching task by ID ${taskId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching task by ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateTask = async (taskId, updates) => {
            try {
                logger_1.default.debug("🟠 REPO → Raw incoming updates: " + JSON.stringify({
                    updates,
                    assignedUsers: updates.assignedUsers
                }));
                const updateData = {
                    ...updates,
                    contextId: updates.contextId ? this.toObjectId(updates.contextId) : undefined,
                    createdBy: updates.createdBy ? this.toObjectId(updates.createdBy) : undefined,
                    assignedUsers: updates.assignedUsers !== undefined
                        ? updates.assignedUsers.map((id) => this.toObjectId(id))
                        : undefined,
                };
                const task = await this.findByIdAndUpdate(taskId, updateData, { new: true });
                if (!task) {
                    logger_1.default.warn(`Task not found: ${taskId}`);
                    throw new error_handler_1.RepositoryError(`Task not found with ID: ${taskId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.debug("🟠 REPO → Raw incoming updates: " + JSON.stringify({
                    updates,
                    assignedUsers: updates.assignedUsers
                }));
                logger_1.default.info(`Task updated: ${taskId} (${task.name})`);
                return task;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating task ${taskId}`, err);
                throw new error_handler_1.RepositoryError('Error updating task', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteTask = async (taskId) => {
            try {
                logger_1.default.debug(`Deleting task: ${taskId}`);
                const task = await this.findById(taskId);
                if (!task) {
                    logger_1.default.warn(`Task not found: ${taskId}`);
                    throw new error_handler_1.RepositoryError(`Task not found with ID: ${taskId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const result = await this.delete(taskId);
                if (!result) {
                    throw new error_handler_1.RepositoryError('Task not found');
                }
                logger_1.default.info(`Task deleted: ${taskId} (${task.name})`);
                return true;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting task ${taskId}`, err);
                throw new error_handler_1.RepositoryError('Error deleting task', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findTasksByContext = async (contextType, contextId, userId) => {
            try {
                logger_1.default.debug(`Fetching tasks for contextType=${contextType}, contextId=${contextId}, userId=${userId}`);
                let query;
                let populatePaths;
                if (contextType === 'user' && userId) {
                    query = {
                        contextType: 'user',
                        $or: [
                            { contextId: this.toObjectId(contextId) },
                            { assignedUsers: this.toObjectId(userId) },
                            { createdBy: this.toObjectId(userId) },
                        ],
                    };
                    populatePaths = [
                        { path: 'createdBy', model: 'User', select: '_id name email jobTitle profilePic' },
                        { path: 'assignedUsers', model: 'User', select: '_id name email jobTitle profilePic' },
                        { path: 'contextId', model: 'User', select: '_id name email jobTitle profilePic' },
                    ];
                }
                else {
                    query = { contextType, contextId: this.toObjectId(contextId) };
                    populatePaths = [
                        { path: 'createdBy', model: 'User', select: '_id name email jobTitle profilePic' },
                        {
                            path: 'contextId',
                            model: contextType === 'group' ? 'Group' : 'Collaboration',
                            populate: contextType === 'group' ? { path: 'members.userId', model: 'User', select: '_id name email jobTitle profilePic' } : undefined,
                        },
                    ];
                }
                const tasks = await this.model
                    .find(query)
                    .populate(populatePaths)
                    .sort({ createdAt: -1 })
                    .exec();
                const today = new Date();
                const updatedTasks = await Promise.all(tasks.map(async (task) => {
                    if (task.dueDate && new Date(task.dueDate) < today && task.status !== 'completed' && task.status !== 'not-completed') {
                        logger_1.default.debug(`Updating status to not-completed for task: ${task._id} due to past due date: ${task.dueDate}`);
                        const updatedTask = await this.model
                            .findByIdAndUpdate(task._id, { status: 'not-completed' }, { new: true })
                            .populate(populatePaths)
                            .exec();
                        if (!updatedTask) {
                            logger_1.default.warn(`Failed to update task status for task: ${task._id}`);
                            return null;
                        }
                        return updatedTask.toObject();
                    }
                    return task.toObject();
                }));
                const validTasks = updatedTasks.filter((task) => {
                    if (task === null) {
                        logger_1.default.warn(`Null task encountered in findTasksByContext`);
                        return false;
                    }
                    return true;
                });
                logger_1.default.info(`Fetched ${validTasks.length} tasks for contextType=${contextType}, contextId=${contextId}`);
                return validTasks;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching tasks for contextType=${contextType}, contextId=${contextId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching tasks by context', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateTaskPriority = async (taskId, priority) => {
            try {
                logger_1.default.debug(`Updating task priority: taskId=${taskId}, priority=${priority}`);
                const task = await this.findByIdAndUpdate(taskId, { priority }, { new: true });
                if (!task) {
                    logger_1.default.warn(`Task not found: ${taskId}`);
                    throw new error_handler_1.RepositoryError(`Task not found with ID: ${taskId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Task priority updated: ${taskId} to ${priority}`);
                return task;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating task priority for task ${taskId}`, err);
                throw new error_handler_1.RepositoryError('Error updating task priority', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateTaskStatus = async (taskId, status) => {
            try {
                logger_1.default.debug(`Updating task status: taskId=${taskId}, status=${status}`);
                const task = await this.findByIdAndUpdate(taskId, { status }, { new: true });
                if (!task) {
                    logger_1.default.warn(`Task not found: ${taskId}`);
                    throw new error_handler_1.RepositoryError(`Task not found with ID: ${taskId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Task status updated: ${taskId} to ${status}`);
                return task;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating task status for task ${taskId}`, err);
                throw new error_handler_1.RepositoryError('Error updating task status', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.isDuplicateTask = async (name, contextId, contextType) => {
            try {
                logger_1.default.debug(`Checking duplicate task: ${name} for contextId=${contextId}, contextType=${contextType}`);
                const existingTask = await this.model
                    .findOne({ name, contextId: this.toObjectId(contextId), contextType })
                    .exec();
                const isDuplicate = !!existingTask;
                logger_1.default.info(`Duplicate check for task ${name} in context ${contextId} (${contextType}) - ${isDuplicate}`);
                return isDuplicate;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error checking duplicate task ${name} for context ${contextId}`, err);
                throw new error_handler_1.RepositoryError('Error checking duplicate task', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
    }
};
exports.TaskRepository = TaskRepository;
exports.TaskRepository = TaskRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], TaskRepository);
//# sourceMappingURL=task-repository.js.map