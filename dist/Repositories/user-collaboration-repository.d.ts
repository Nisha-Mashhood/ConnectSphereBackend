import { BaseRepository } from '../core/repositries/base-repositry';
import { IUserConnection } from '../Interfaces/Models/i-user-connection';
import { IUserConnectionRepository } from '../Interfaces/Repository/i-user-collaboration-repositry';
export declare class UserConnectionRepository extends BaseRepository<IUserConnection> implements IUserConnectionRepository {
    constructor();
    private toObjectId;
    createUserConnection: (requesterId: string, recipientId: string) => Promise<IUserConnection>;
    updateUserConnectionStatus: (connectionId: string, status: "Accepted" | "Rejected") => Promise<IUserConnection | null>;
    disconnectUserConnection: (connectionId: string, reason: string) => Promise<IUserConnection | null>;
    getUserConnections: (userId: string) => Promise<IUserConnection[]>;
    getAllUserConnections: (page?: number, limit?: number, search?: string) => Promise<{
        connections: IUserConnection[];
        total: number;
        page: number;
        pages: number;
    }>;
    getUserRequests: (userId: string) => Promise<{
        sentRequests: IUserConnection[];
        receivedRequests: IUserConnection[];
    }>;
    getUserConnectionById: (connectionId: string) => Promise<IUserConnection | null>;
    findExistingConnection: (requesterId: string, recipientId: string) => Promise<IUserConnection | null>;
    getConnectionUserIds: (connectionId: string) => Promise<{
        requester: string;
        recipient: string;
    } | null>;
}
//# sourceMappingURL=user-collaboration-repository.d.ts.map