import { IMentor } from "../Interfaces/Models/i-mentor";
import { CompleteMentorDetails, MentorAnalytics, MentorExperienceInput, MentorQuery, SalesReport } from "../Utils/types/mentor-types";
import { IMentorService } from "../Interfaces/Services/i-mentor-service";
import { IMentorRepository } from "../Interfaces/Repository/i-mentor-repositry";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { ICollaborationRepository } from "../Interfaces/Repository/i-collaboration-repositry";
import { INotificationService } from "../Interfaces/Services/i-notification-service";
import { ICategoryRepository } from "../Interfaces/Repository/i-category-repositry";
import { ISkillsRepository } from "../Interfaces/Repository/i-skills-repositry";
import { IMentorDTO } from "../Interfaces/DTOs/i-mentor-dto";
import { IMentorExperienceRepository } from "../Interfaces/Repository/i-mentor-experience-repository";
import { IMentorExperience } from "../Interfaces/Models/i-mentor-experience";
import { IMentorExperienceDTO } from "../Interfaces/DTOs/i-mentor-experience-dto";
import { ICollaborationService } from "../Interfaces/Services/i-collaboration-service";
export declare class MentorService implements IMentorService {
    private _mentorRepository;
    private _authRepository;
    private _collabRepository;
    private _notificationService;
    private _categoryRepository;
    private _skillRepository;
    private _mentorExperienceRepository;
    private _collabService;
    constructor(mentorRepository: IMentorRepository, userRepository: IUserRepository, collaborationRepository: ICollaborationRepository, notificationService: INotificationService, categoryService: ICategoryRepository, skillRepository: ISkillsRepository, mentorExperienceRepository: IMentorExperienceRepository, collaborationService: ICollaborationService);
    submitMentorRequest: (mentorData: {
        userId: string;
        skills: string[];
        specialization: string;
        bio: string;
        price: number;
        availableSlots: object[];
        timePeriod: number;
        certifications: string[];
        experiences?: MentorExperienceInput[];
    }) => Promise<IMentorDTO | null>;
    getAllMentorRequests: (page?: number, limit?: number, search?: string, status?: string, sort?: "asc" | "desc") => Promise<{
        mentors: IMentorDTO[];
        total: number;
        page: number;
        pages: number;
    }>;
    getAllMentors: (query: MentorQuery) => Promise<{
        mentors: CompleteMentorDetails[];
        total: number;
    }>;
    getMentorByMentorId: (mentorId: string) => Promise<IMentorDTO | null>;
    getMentorExperiences: (mentorId: string) => Promise<IMentorExperienceDTO[]>;
    approveMentorRequest: (id: string) => Promise<void>;
    rejectMentorRequest: (id: string, reason: string) => Promise<void>;
    cancelMentorship: (id: string) => Promise<void>;
    getMentorByUserId: (userId: string) => Promise<IMentorDTO | null>;
    updateMentorById: (mentorId: string, updateData: Partial<IMentor>) => Promise<IMentorDTO | null>;
    getMentorAnalytics: (page?: number, limit?: number, sortBy?: "totalEarnings" | "platformFees" | "totalCollaborations" | "avgCollabPrice", sortOrder?: "asc" | "desc", search?: string) => Promise<{
        mentors: MentorAnalytics[];
        total: number;
        page: number;
        pages: number;
    }>;
    getSalesReport: (period: string) => Promise<SalesReport>;
    generateSalesReportPDF: (period?: string) => Promise<Buffer>;
    addMentorExperience: (userId: string, data: Partial<IMentorExperience>) => Promise<IMentorExperienceDTO>;
    updateMentorExperience: (userId: string, experienceId: string, data: Partial<IMentorExperience>) => Promise<IMentorExperienceDTO>;
    deleteMentorExperience: (userId: string, experienceId: string) => Promise<void>;
}
//# sourceMappingURL=mentor-service.d.ts.map