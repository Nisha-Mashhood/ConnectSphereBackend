import { Request, Response } from "express";
import { ITask } from "../Models/i-task";
import type { NextFunction } from "express";
export interface TaskRequest extends Request {
    body: Partial<ITask> & {
        taskData?: string;
        priority?: string;
        status?: string;
    };
    params: {
        id?: string;
        taskId?: string;
        contextId?: string;
        contextType?: string;
        userId?: string;
    };
    file?: Request["file"];
}
export interface ITaskController {
    createTask(req: TaskRequest, res: Response, next: NextFunction): Promise<void>;
    getTasksByContext(req: TaskRequest, res: Response, next: NextFunction): Promise<void>;
    updateTaskPriority(req: TaskRequest, res: Response, next: NextFunction): Promise<void>;
    updateTaskStatus(req: TaskRequest, res: Response, next: NextFunction): Promise<void>;
    editTask(req: TaskRequest, res: Response, next: NextFunction): Promise<void>;
    deleteTask(req: TaskRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=i-task-controller.d.ts.map