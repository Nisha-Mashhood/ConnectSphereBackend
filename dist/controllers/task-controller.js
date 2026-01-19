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
exports.TaskController = void 0;
const inversify_1 = require("inversify");
const logger_1 = __importDefault(require("../core/utils/logger"));
const mongoose_1 = require("mongoose");
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const base_controller_1 = require("../core/controller/base-controller");
const messages_1 = require("../constants/messages");
const error_messages_1 = require("../constants/error-messages");
let TaskController = class TaskController extends base_controller_1.BaseController {
    constructor(taskService) {
        super();
        this.createTask = async (req, res, next) => {
            try {
                const { id } = req.params;
                const imagePath = req.file?.path;
                const fileSize = req.file?.size;
                const taskData = req.body.taskData ? JSON.parse(req.body.taskData) : req.body;
                taskData.createdBy = this.toObjectId(id);
                logger_1.default.debug(`Creating task for user: ${id}, task: ${taskData.name}`);
                const newTask = await this._taskService.createTask(taskData, imagePath, fileSize);
                this.sendCreated(res, newTask, messages_1.TASK_MESSAGES.TASK_CREATED);
            }
            catch (error) {
                logger_1.default.error(`Error creating task: ${error.message}`);
                next(error);
            }
        };
        this.getTasksByContext = async (req, res, next) => {
            try {
                const { contextType, contextId, userId } = req.params;
                logger_1.default.debug(`Fetching tasks for contextType=${contextType}, contextId=${contextId}, userId=${userId}`);
                const tasks = await this._taskService.getTasksByContext(contextType, contextId, userId);
                const data = tasks.length === 0 ? [] : tasks;
                const message = tasks.length === 0 ? messages_1.TASK_MESSAGES.NO_TASKS_FOUND : messages_1.TASK_MESSAGES.TASKS_FETCHED;
                this.sendSuccess(res, data, message);
            }
            catch (error) {
                logger_1.default.error(`Error fetching tasks: ${error.message}`);
                next(error);
            }
        };
        this.updateTaskPriority = async (req, res, next) => {
            try {
                const { taskId } = req.params;
                const { priority } = req.body;
                logger_1.default.debug(`Updating task priority: taskId=${taskId}, priority=${priority}`);
                const updatedTask = await this._taskService.changeTaskPriority(taskId, priority);
                if (!updatedTask) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.TASK_NOT_FOUND, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                this.sendSuccess(res, updatedTask, messages_1.TASK_MESSAGES.TASK_PRIORITY_UPDATED);
            }
            catch (error) {
                logger_1.default.error(`Error updating task priority: ${error.message}`);
                next(error);
            }
        };
        this.updateTaskStatus = async (req, res, next) => {
            try {
                const { taskId } = req.params;
                const { status } = req.body;
                logger_1.default.debug(`Updating task status: taskId=${taskId}, status=${status}`);
                const updatedTask = await this._taskService.changeTaskStatus(taskId, status);
                if (!updatedTask) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.TASK_NOT_FOUND, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                this.sendSuccess(res, updatedTask, messages_1.TASK_MESSAGES.TASK_STATUS_UPDATED);
            }
            catch (error) {
                logger_1.default.error(`Error updating task status: ${error.message}`);
                next(error);
            }
        };
        this.editTask = async (req, res, next) => {
            try {
                const { taskId } = req.params;
                const updates = req.body.taskData ? JSON.parse(req.body.taskData) : req.body;
                logger_1.default.debug("🔵 CONTROLLER → Received task update: " + JSON.stringify({
                    taskId,
                    updates,
                    assignedUsers: updates?.assignedUsers
                }));
                logger_1.default.debug(`Editing task: taskId=${taskId}`);
                const updatedTask = await this._taskService.editTask(taskId, updates);
                if (!updatedTask) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.TASK_NOT_FOUND, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                this.sendSuccess(res, updatedTask, messages_1.TASK_MESSAGES.TASK_UPDATED);
            }
            catch (error) {
                logger_1.default.error(`Error editing task: ${error.message}`);
                next(error);
            }
        };
        this.deleteTask = async (req, res, next) => {
            try {
                const { taskId } = req.params;
                logger_1.default.debug(`Deleting task: ${taskId}`);
                await this._taskService.deleteTask(taskId);
                this.sendSuccess(res, null, messages_1.TASK_MESSAGES.TASK_DELETED);
            }
            catch (error) {
                logger_1.default.error(`Error deleting task: ${error.message}`);
                next(error);
            }
        };
        this._taskService = taskService;
    }
    toObjectId(id) {
        if (!id) {
            logger_1.default.error('Missing ID');
            throw new error_handler_1.HttpError('Invalid ID: ID is required', status_code_enums_1.StatusCodes.BAD_REQUEST);
        }
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            logger_1.default.error(`Invalid ID: ${id}`);
            throw new error_handler_1.HttpError('Invalid ID: must be a 24 character hex string', status_code_enums_1.StatusCodes.BAD_REQUEST);
        }
        return new mongoose_1.Types.ObjectId(id);
    }
};
exports.TaskController = TaskController;
exports.TaskController = TaskController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('ITaskService')),
    __metadata("design:paramtypes", [Object])
], TaskController);
//# sourceMappingURL=task-controller.js.map