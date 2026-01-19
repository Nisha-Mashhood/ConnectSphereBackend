import { IAdminRepository } from "../Interfaces/Repository/i-admin-repositry";
import { RevenueStats, RevenueTrend, TopMentor, UserGrowth } from "../Utils/types/admin-types";
import { IMentor } from "../Interfaces/Models/i-mentor";
import { ICollaboration } from "../Interfaces/Models/i-collaboration";
import { IFeedbackRepository } from "../Interfaces/Repository/i-feedback-repositry";
export declare class AdminRepository implements IAdminRepository {
    private _feedbackRepository;
    constructor(feedbackRepository: IFeedbackRepository);
    getTotalUsersCount: () => Promise<number>;
    getTotalMentorsCount: () => Promise<number>;
    getTotalRevenue: () => Promise<RevenueStats>;
    getPendingMentorRequestsCount: () => Promise<number>;
    getActiveCollaborationsCount: () => Promise<number>;
    getRevenueTrends: (timeFormat: string, days: number) => Promise<RevenueTrend[]>;
    getUserGrowth: (timeFormat: string, days: number) => Promise<UserGrowth[]>;
    getPendingMentorRequests: (limit?: number) => Promise<IMentor[]>;
    getTopMentors: (limit: number) => Promise<TopMentor[]>;
    getRecentCollaborations: (limit: number) => Promise<ICollaboration[]>;
}
//# sourceMappingURL=admin-dashboard-repository.d.ts.map