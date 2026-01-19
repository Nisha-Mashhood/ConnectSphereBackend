import { BaseRepository } from '../core/repositries/base-repositry';
import { IContactMessage } from '../Interfaces/Models/i-contact-message';
import { IContactMessageRepository } from '../Interfaces/Repository/i-contact-message-repositry';
export declare class ContactMessageRepository extends BaseRepository<IContactMessage> implements IContactMessageRepository {
    constructor();
    createContactMessage: (data: {
        name: string;
        email: string;
        message: string;
    }) => Promise<IContactMessage>;
    getAllContactMessages({ page, limit, search, dateFilter, }: {
        page?: number;
        limit?: number;
        search?: string;
        dateFilter?: "today" | "7days" | "30days" | "all";
    }): Promise<{
        messages: IContactMessage[];
        total: number;
        page: number;
        pages: number;
    }>;
    updateReplyStatus: (contactMessageId: string) => Promise<IContactMessage | null>;
}
//# sourceMappingURL=contact-us-repository.d.ts.map