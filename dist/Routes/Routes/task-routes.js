"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ratelimit_middleware_1 = require("../../middlewares/ratelimit-middleware");
const multer_1 = require("../../core/utils/multer");
const task_routes_1 = require("../Constants/task-routes");
const container_1 = __importDefault(require("../../container"));
const router = express_1.default.Router();
const taskController = container_1.default.get('ITaskController');
const authMiddleware = container_1.default.get('IAuthMiddleware');
router.post(task_routes_1.TASK_ROUTES.CreateTask, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, multer_1.upload.single('image')], taskController.createTask.bind(taskController));
router.get(task_routes_1.TASK_ROUTES.GetTasksByContext, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], taskController.getTasksByContext.bind(taskController));
router.patch(task_routes_1.TASK_ROUTES.UpdateTaskPriority, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], taskController.updateTaskPriority.bind(taskController));
router.patch(task_routes_1.TASK_ROUTES.UpdateTaskStatus, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], taskController.updateTaskStatus.bind(taskController));
router.put(task_routes_1.TASK_ROUTES.EditTask, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, multer_1.upload.single("image")], taskController.editTask.bind(taskController));
router.delete(task_routes_1.TASK_ROUTES.DeleteTask, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], taskController.deleteTask.bind(taskController));
exports.default = router;
//# sourceMappingURL=task-routes.js.map