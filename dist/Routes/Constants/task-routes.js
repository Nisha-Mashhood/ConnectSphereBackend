"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TASK_ROUTES = void 0;
exports.TASK_ROUTES = {
    CreateTask: '/createNewTask/:id',
    GetTasksByContext: '/context/:contextType/:contextId/:userId',
    UpdateTaskPriority: '/updatePriority/:taskId',
    UpdateTaskStatus: '/updateStatus/:taskId',
    EditTask: '/editTask/:taskId',
    DeleteTask: '/delete/:taskId',
};
//# sourceMappingURL=task-routes.js.map