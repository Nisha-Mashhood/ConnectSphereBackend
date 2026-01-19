import { IContact } from "../Interfaces/Models/i-contact";
import { IUserConnectionRepository } from "../Interfaces/Repository/i-user-collaboration-repositry";
import { IContactRepository } from "../Interfaces/Repository/i-contact-repositry";
import { IUserConnectionDTO } from "../Interfaces/DTOs/i-user-connection-dto";
import { IUserConnectionService } from "../Interfaces/Services/i-user-collaboration-service";
export declare class UserConnectionService implements IUserConnectionService {
    private _userConnectionRepository;
    private _contactRepository;
    constructor(userConnectionRepository: IUserConnectionRepository, contactRepository: IContactRepository);
    sendUserConnectionRequest: (requesterId: string, recipientId: string) => Promise<IUserConnectionDTO>;
    respondToConnectionRequest: (connectionId: string, action: "Accepted" | "Rejected") => Promise<{
        updatedConnection: IUserConnectionDTO;
        contacts?: IContact[];
    }>;
    disconnectConnection: (connectionId: string, reason: string) => Promise<IUserConnectionDTO | null>;
    fetchUserConnections: (userId: string) => Promise<IUserConnectionDTO[]>;
    fetchUserRequests: (userId: string) => Promise<{
        sentRequests: IUserConnectionDTO[];
        receivedRequests: IUserConnectionDTO[];
    }>;
    fetchAllUserConnections: (page: number, limit: number, search: string) => Promise<{
        connections: IUserConnectionDTO[];
        total: number;
    }>;
    fetchUserConnectionById: (connectionId: string) => Promise<IUserConnectionDTO | null>;
}
//# sourceMappingURL=user-collaboartion-service.d.ts.map