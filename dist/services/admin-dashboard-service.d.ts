import { IAdminService } from "../Interfaces/Services/i-admin-service";
import { RevenueStats, RevenueTrend, TopMentor, UserGrowth } from "../Utils/types/admin-types";
import { IAdminRepository } from "../Interfaces/Repository/i-admin-repositry";
import { IMentorDTO } from "../Interfaces/DTOs/i-mentor-dto";
import { ICollaborationDTO } from "../Interfaces/DTOs/i-collaboration-dto";
import { ProfileUpdateData } from "../Utils/types/auth-types";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { IUserAdminDTO } from "../Interfaces/DTOs/i-user-dto";
export declare class AdminService implements IAdminService {
    private _adminRepository;
    private _userRepository;
    constructor(adminRepository: IAdminRepository, userRepository: IUserRepository);
    getTotalUsersCount: () => Promise<number>;
    getTotalMentorsCount: () => Promise<number>;
    getTotalRevenue: () => Promise<RevenueStats>;
    getPendingMentorRequestsCount: () => Promise<number>;
    getActiveCollaborationsCount: () => Promise<number>;
    getRevenueTrends: (timeFormat: string, days: number) => Promise<RevenueTrend[]>;
    getUserGrowth: (timeFormat: string, days: number) => Promise<UserGrowth[]>;
    getPendingMentorRequests: (limit?: number) => Promise<IMentorDTO[]>;
    getTopMentors: (limit: number) => Promise<TopMentor[]>;
    getRecentCollaborations: (limit: number) => Promise<ICollaborationDTO[]>;
    AdminprofileDetails: (userId: string) => Promise<IUserAdminDTO | null>;
    updateAdminProfile: (userId: string, data: ProfileUpdateData) => Promise<IUserAdminDTO>;
}
//# sourceMappingURL=admin-dashboard-service.d.ts.map