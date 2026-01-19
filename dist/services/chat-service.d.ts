import { IChatRepository } from "../Interfaces/Repository/i-chat-repositry";
import { IContactRepository } from "../Interfaces/Repository/i-contact-repositry";
import { IGroupRepository } from "../Interfaces/Repository/i-group-repositry";
import { IChatService } from "../Interfaces/Services/i-chat-service";
import { IChatMessageDTO } from "../Interfaces/DTOs/i-chat-message-dto";
import { LastMessageSummary } from "../Utils/types/contact-types";
export declare class ChatService implements IChatService {
    private _chatRepository;
    private _contactRepository;
    private _groupRepository;
    constructor(chatRepository: IChatRepository, contactRepository: IContactRepository, groupRepository: IGroupRepository);
    getChatMessages: (contactId?: string, groupId?: string, page?: number, limit?: number) => Promise<{
        messages: IChatMessageDTO[];
        total: number;
    }>;
    getUnreadMessageCounts: (userId: string) => Promise<{
        [key: string]: number;
    }>;
    uploadAndSaveMessage: (data: {
        senderId: string;
        targetId: string;
        type: "user-mentor" | "user-user" | "group";
        collaborationId?: string;
        userConnectionId?: string;
        groupId?: string;
        file: {
            path: string;
            size?: number;
            originalname?: string;
            mimetype?: string;
        };
    }) => Promise<{
        url: string;
        thumbnailUrl?: string;
        messageId: string;
    }>;
    getLastMessageSummaries: (userId: string) => Promise<{
        [chatKey: string]: LastMessageSummary;
    }>;
}
//# sourceMappingURL=chat-service.d.ts.map