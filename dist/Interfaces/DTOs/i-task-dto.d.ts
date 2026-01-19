import { IUserDTO } from './i-user-dto';
import { ICollaborationDTO } from './i-collaboration-dto';
import { IGroupDTO } from './i-group-dto';
export interface ITaskDTO {
    id: string;
    taskId: string;
    name: string;
    description?: string;
    image?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in-progress' | 'completed' | 'not-completed';
    startDate: Date;
    dueDate: Date;
    notificationDate?: Date;
    notificationTime?: string;
    contextType: 'user' | 'group' | 'collaboration';
    contextId: string;
    context?: IUserDTO | IGroupDTO | ICollaborationDTO;
    assignedUsers: string[];
    assignedUsersDetails?: IUserDTO[];
    createdBy: string;
    createdByDetails?: IUserDTO;
    createdAt: Date;
}
//# sourceMappingURL=i-task-dto.d.ts.map