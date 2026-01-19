import { IUserDTO } from './i-user-dto';
import { ICollaborationDTO } from './i-collaboration-dto';
import { IUserConnectionDTO } from './i-user-connection-dto';
import { IGroupDTO } from './i-group-dto';
export interface IChatMessageDTO {
    id: string;
    ChatId: string;
    senderId: string;
    sender?: IUserDTO;
    content: string;
    thumbnailUrl?: string;
    collaborationId?: string;
    collaboration?: ICollaborationDTO;
    userConnectionId?: string;
    userConnection?: IUserConnectionDTO;
    groupId?: string;
    group?: IGroupDTO;
    contentType: 'text' | 'image' | 'video' | 'file';
    fileMetadata?: {
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
    };
    isRead: boolean;
    status: 'pending' | 'sent' | 'read';
    timestamp: Date;
}
//# sourceMappingURL=i-chat-message-dto.d.ts.map