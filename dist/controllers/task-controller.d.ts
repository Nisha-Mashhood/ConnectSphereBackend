import { NextFunction, Request, Response } from 'express';
import { ITaskController } from '../Interfaces/Controller/i-task-controller';
import { BaseController } from '../core/controller/base-controller';
import { ITaskService } from '../Interfaces/Services/i-task-service';
export declare class TaskController extends BaseController implements ITaskController {
    private _taskService;
    constructor(taskService: ITaskService);
    private toObjectId;
    createTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTasksByContext: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateTaskPriority: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateTaskStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    editTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=task-controller.d.ts.map