import { GroupFormData, GroupQuery } from "../Utils/types/group-types";
import { IGroupService } from "../Interfaces/Services/i-group-service";
import { IGroupRepository } from "../Interfaces/Repository/i-group-repositry";
import { IContactRepository } from "../Interfaces/Repository/i-contact-repositry";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { IGroupDTO } from "../Interfaces/DTOs/i-group-dto";
import { IGroupRequestDTO } from "../Interfaces/DTOs/i-group-request-dto";
export declare class GroupService implements IGroupService {
    private _groupRepository;
    private _contactRepository;
    private _userRepository;
    constructor(groupRepository: IGroupRepository, contactRepository: IContactRepository, userRepository: IUserRepository);
    createGroup: (groupData: GroupFormData) => Promise<IGroupDTO | null>;
    getGroupDetails: (adminId: string) => Promise<IGroupDTO[]>;
    getGroupById: (groupId: string) => Promise<IGroupDTO | null>;
    getAllGroups: (query?: GroupQuery) => Promise<{
        groups: IGroupDTO[];
        total: number;
    }>;
    requestToJoinGroup: (groupId: string, userId: string) => Promise<IGroupRequestDTO>;
    getGroupRequestsByGroupId: (groupId: string) => Promise<IGroupRequestDTO[]>;
    getGroupRequestsByAdminId: (adminId: string) => Promise<IGroupRequestDTO[]>;
    getGroupRequestsByUserId: (userId: string) => Promise<IGroupRequestDTO[]>;
    getGroupRequestById: (requestId: string) => Promise<IGroupRequestDTO | null>;
    modifyGroupRequestStatus: (requestId: string, status: "Accepted" | "Rejected") => Promise<{
        message: string;
        requiresPayment?: boolean;
        groupPrice?: number;
        groupId?: string;
    }>;
    processGroupPayment: (paymentMethodId: string | {
        id: string;
    }, amount: number, requestId: string, email: string, groupRequestData: {
        groupId: string;
        userId: string;
    }, returnUrl: string) => Promise<{
        paymentIntent: any;
    }>;
    removeGroupMember: (groupId: string, userId: string) => Promise<IGroupDTO | null>;
    deleteGroup: (groupId: string) => Promise<IGroupDTO | null>;
    updateGroupImage: (groupId: string, profilePic?: string, coverPic?: string) => Promise<IGroupDTO | null>;
    getGroupDetailsForMembers: (userId: string) => Promise<IGroupDTO[]>;
    getAllGroupRequests: (search?: string, page?: number, limit?: number) => Promise<{
        requests: IGroupRequestDTO[];
        total: number;
    }>;
}
//# sourceMappingURL=group-service.d.ts.map