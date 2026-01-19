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
exports.TaskService = void 0;
const inversify_1 = require("inversify");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const cloudinary_1 = require("../core/utils/cloudinary");
const status_code_enums_1 = require("../enums/status-code-enums");
const task_mapper_1 = require("../Utils/mappers/task-mapper");
let TaskService = class TaskService {
    constructor(taskRepository, notificationRepository) {
        this.createTask = async (taskData, imagePath, fileSize) => {
            try {
                logger_1.default.debug(`Creating task: ${taskData.name}`);
                if (!taskData.name || !taskData.createdBy || !taskData.contextType || !taskData.contextId) {
                    logger_1.default.error("Missing required fields: name, createdBy, contextType, or contextId");
                    throw new error_handler_1.ServiceError("Task name, createdBy, contextType, and contextId are required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const validContextTypes = ["collaboration", "group", "user"];
                if (!validContextTypes.includes(taskData.contextType)) {
                    logger_1.default.error(`Invalid contextType: ${taskData.contextType}`);
                    throw new error_handler_1.ServiceError(`contextType must be one of: ${validContextTypes.join(", ")}`, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                let image;
                if (imagePath) {
                    logger_1.default.debug(`Uploading image for task: ${taskData.name}`);
                    const { url } = await (0, cloudinary_1.uploadMedia)(imagePath, "tasks", fileSize);
                    image = url;
                    logger_1.default.info(`Uploaded image for task: ${image}`);
                }
                const createdTask = await this._taskRepository.createTask({ ...taskData, image });
                const taskDTO = (0, task_mapper_1.toTaskDTO)(createdTask);
                if (!taskDTO) {
                    logger_1.default.error(`Failed to map task ${createdTask._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map task to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Task created: ${createdTask._id} (${createdTask.name})`);
                return taskDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating task ${taskData.name}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to create task", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getTasksByContext = async (contextType, contextId, userId) => {
            try {
                logger_1.default.debug(`Fetching tasks for contextType=${contextType}, contextId=${contextId}, userId=${userId}`);
                const validContextTypes = ["collaboration", "group", "user"];
                if (!validContextTypes.includes(contextType)) {
                    logger_1.default.error(`Invalid contextType: ${contextType}`);
                    throw new error_handler_1.ServiceError(`contextType must be one of: ${validContextTypes.join(", ")}`, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const tasks = await this._taskRepository.findTasksByContext(contextType, contextId, userId);
                const taskDTOs = (0, task_mapper_1.toTaskDTOs)(tasks);
                logger_1.default.info(`Fetched ${taskDTOs.length} tasks for context: ${contextType}/${contextId}`);
                return taskDTOs;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching tasks for context ${contextType}/${contextId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch tasks by context", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.changeTaskPriority = async (taskId, priority) => {
            try {
                logger_1.default.debug(`Changing task priority: taskId=${taskId}, priority=${priority}`);
                const validPriorities = ["low", "medium", "high"];
                if (!validPriorities.includes(priority)) {
                    logger_1.default.error(`Invalid priority: ${priority}`);
                    throw new error_handler_1.ServiceError(`Priority must be one of: ${validPriorities.join(", ")}`, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const task = await this._taskRepository.updateTaskPriority(taskId, priority);
                if (!task) {
                    logger_1.default.warn(`Task not found: ${taskId}`);
                    throw new error_handler_1.ServiceError("Task not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const taskDTO = (0, task_mapper_1.toTaskDTO)(task);
                if (!taskDTO) {
                    logger_1.default.error(`Failed to map task ${task._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map task to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Task priority changed: ${taskId} to ${priority}`);
                return taskDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error changing task priority for task ${taskId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to change task priority", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.changeTaskStatus = async (taskId, status) => {
            try {
                logger_1.default.debug(`Changing task status: taskId=${taskId}, status=${status}`);
                const validStatuses = ["pending", "in-progress", "completed", "not-completed"];
                if (!validStatuses.includes(status)) {
                    logger_1.default.error(`Invalid status: ${status}`);
                    throw new error_handler_1.ServiceError(`Status must be one of: ${validStatuses.join(", ")}`, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const task = await this._taskRepository.updateTaskStatus(taskId, status);
                if (!task) {
                    logger_1.default.warn(`Task not found: ${taskId}`);
                    throw new error_handler_1.ServiceError("Task not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const taskDTO = (0, task_mapper_1.toTaskDTO)(task);
                if (!taskDTO) {
                    logger_1.default.error(`Failed to map task ${task._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map task to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Task status changed: ${taskId} to ${status}`);
                return taskDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error changing task status for task ${taskId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to change task status", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.editTask = async (taskId, updates) => {
            try {
                logger_1.default.debug(`Editing task: taskId=${taskId}`);
                const task = await this._taskRepository.updateTask(taskId, updates);
                if (!task) {
                    logger_1.default.warn(`Task not found: ${taskId}`);
                    throw new error_handler_1.ServiceError("Task not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const taskDTO = (0, task_mapper_1.toTaskDTO)(task);
                if (!taskDTO) {
                    logger_1.default.error(`Failed to map task ${task._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map task to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                if (updates.notificationDate || updates.notificationTime) {
                    logger_1.default.debug(`Updating notifications for task: ${taskId}`);
                    await this._notificationRepository.updateTaskNotifications(taskId, updates.notificationDate, updates.notificationTime);
                    logger_1.default.info(`Updated notifications for task: ${taskId}`);
                }
                logger_1.default.info(`Task updated: ${taskId} (${task.name})`);
                return taskDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error editing task ${taskId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to edit task", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteTask = async (taskId) => {
            try {
                logger_1.default.debug(`Deleting task: ${taskId}`);
                const task = await this._taskRepository.deleteTask(taskId);
                if (!task) {
                    logger_1.default.warn(`Task not found: ${taskId}`);
                    throw new error_handler_1.ServiceError("Task not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Task deleted: ${taskId}`);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting task ${taskId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to delete task", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._taskRepository = taskRepository;
        this._notificationRepository = notificationRepository;
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('ITaskRepository')),
    __param(1, (0, inversify_1.inject)('INotificationRepository')),
    __metadata("design:paramtypes", [Object, Object])
], TaskService);
//# sourceMappingURL=task-service.js.map