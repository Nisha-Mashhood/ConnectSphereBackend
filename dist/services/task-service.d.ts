import { ITask } from "../Interfaces/Models/i-task";
import { ITaskRepository } from "../Interfaces/Repository/i-task-repositry";
import { INotificationRepository } from "../Interfaces/Repository/i-notification-repositry";
import { ITaskService } from "../Interfaces/Services/i-task-service";
import { ITaskDTO } from "../Interfaces/DTOs/i-task-dto";
export declare class TaskService implements ITaskService {
    private _taskRepository;
    private _notificationRepository;
    constructor(taskRepository: ITaskRepository, notificationRepository: INotificationRepository);
    createTask: (taskData: Partial<ITask>, imagePath?: string, fileSize?: number) => Promise<ITaskDTO>;
    getTasksByContext: (contextType: string, contextId: string, userId: string) => Promise<ITaskDTO[]>;
    changeTaskPriority: (taskId: string, priority: "low" | "medium" | "high") => Promise<ITaskDTO | null>;
    changeTaskStatus: (taskId: string, status: "pending" | "in-progress" | "completed" | "not-completed") => Promise<ITaskDTO | null>;
    editTask: (taskId: string, updates: Partial<ITask>) => Promise<ITaskDTO | null>;
    deleteTask: (taskId: string) => Promise<void>;
}
//# sourceMappingURL=task-service.d.ts.map