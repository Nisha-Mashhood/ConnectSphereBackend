import { ClientSession } from 'mongoose';
import { BaseRepository } from '../core/repositries/base-repositry';
import { IContact } from '../Interfaces/Models/i-contact';
import { PopulatedContact } from '../Utils/types/contact-types';
import { IContactRepository } from '../Interfaces/Repository/i-contact-repositry';
import { IChatRepository } from '../Interfaces/Repository/i-chat-repositry';
export declare class ContactRepository extends BaseRepository<IContact> implements IContactRepository {
    private _chatRepo;
    constructor(chatRepository: IChatRepository);
    private toObjectId;
    createContact: (contactData: Partial<IContact>, session?: ClientSession) => Promise<IContact>;
    findContactById: (contactId: string) => Promise<IContact | null>;
    findContactByUsers: (userId: string, targetUserId: string) => Promise<IContact | null>;
    findContactsByUserId: (userId?: string) => Promise<PopulatedContact[]>;
    deleteContact: (id: string, type: "group" | "user-mentor" | "user-user", userId?: string) => Promise<number>;
}
//# sourceMappingURL=contact-repository.d.ts.map