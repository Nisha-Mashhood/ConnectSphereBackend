import { BaseRepository } from "../core/repositries/base-repositry";
import { IChatMessage } from "../Interfaces/Models/i-chat-message";
import { IChatRepository } from "../Interfaces/Repository/i-chat-repositry";
export declare class ChatRepository extends BaseRepository<IChatMessage> implements IChatRepository {
    constructor();
    private toObjectId;
    saveChatMessage: (data: Partial<IChatMessage>) => Promise<IChatMessage>;
    findChatMessageById: (messageId: string) => Promise<IChatMessage | null>;
    findChatMessagesByCollaborationId: (collaborationId: string, page: number, limit: number) => Promise<IChatMessage[]>;
    findChatMessagesByUserConnectionId: (userConnectionId: string, page: number, limit: number) => Promise<IChatMessage[]>;
    findChatMessagesByGroupId: (groupId: string, page: number, limit: number) => Promise<IChatMessage[]>;
    countMessagesByCollaborationId: (collaborationId: string) => Promise<number>;
    countMessagesByUserConnectionId: (userConnectionId: string) => Promise<number>;
    countMessagesByGroupId: (groupId: string) => Promise<number>;
    countUnreadMessagesByGroupId: (groupId: string, userId: string) => Promise<number>;
    countUnreadMessagesByCollaborationId: (collaborationId: string, userId: string) => Promise<number>;
    countUnreadMessagesByUserConnectionId: (userConnectionId: string, userId: string) => Promise<number>;
    markMessagesAsRead: (chatKey: string, userId: string, type: "group" | "user-mentor" | "user-user") => Promise<string[]>;
    findLatestMessageByGroupId(groupId: string): Promise<IChatMessage | null>;
    findLatestMessageByCollaborationId(collaborationId: string): Promise<IChatMessage | null>;
    findLatestMessageByUserConnectionId(userConnectionId: string): Promise<IChatMessage | null>;
}
//# sourceMappingURL=chat-repository.d.ts.map