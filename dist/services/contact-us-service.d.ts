import { IContactMessageService } from "../Interfaces/Services/i-contact-message-service";
import { IContactMessageRepository } from "../Interfaces/Repository/i-contact-message-repositry";
import { IContactMessageDTO } from "../Interfaces/DTOs/i-contact-message-dto";
export declare class ContactMessageService implements IContactMessageService {
    private contactMessageRepo;
    constructor(contactMessageRepository: IContactMessageRepository);
    createContactMessage: (data: {
        name: string;
        email: string;
        message: string;
    }) => Promise<IContactMessageDTO>;
    getAllContactMessages: ({ page, limit, search, dateFilter, }: {
        page?: number;
        limit?: number;
        search?: string;
        dateFilter?: "today" | "7days" | "30days" | "all";
    }) => Promise<{
        messages: IContactMessageDTO[];
        total: number;
        page: number;
        pages: number;
    }>;
    sendReply: (contactMessageId: string, replyData: {
        email: string;
        replyMessage: string;
    }) => Promise<IContactMessageDTO>;
}
//# sourceMappingURL=contact-us-service.d.ts.map