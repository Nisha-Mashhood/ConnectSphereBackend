import { FormattedContact } from "../Utils/types/contact-types";
import { IContactService } from "../Interfaces/Services/i-contact-service";
import { IContactRepository } from "../Interfaces/Repository/i-contact-repositry";
export declare class ContactService implements IContactService {
    private _contactRepository;
    constructor(contactRepository: IContactRepository);
    getUserContacts: (userId?: string) => Promise<FormattedContact[]>;
}
//# sourceMappingURL=contact-service.d.ts.map