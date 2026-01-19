import { BaseRepository } from "../core/repositries/base-repositry";
import { IMentor } from "../Interfaces/Models/i-mentor";
import { CompleteMentorDetails, MentorQuery } from "../Utils/types/mentor-types";
import { IMentorRepository } from "../Interfaces/Repository/i-mentor-repositry";
import { ClientSession } from "mongoose";
export declare class MentorRepository extends BaseRepository<IMentor> implements IMentorRepository {
    constructor();
    private toObjectId;
    saveMentorRequest: (data: {
        userId: string;
        skills: string[];
        specialization: string;
        bio: string;
        price: number;
        availableSlots: object[];
        timePeriod: number;
        certifications: string[];
    }, options?: {
        session?: ClientSession;
    }) => Promise<IMentor>;
    getAllMentorRequests: (page?: number, limit?: number, search?: string, status?: string, sort?: string) => Promise<{
        mentors: IMentor[];
        total: number;
        page: number;
        pages: number;
    }>;
    getAllMentors: (query?: MentorQuery) => Promise<{
        mentors: CompleteMentorDetails[];
        total: number;
    }>;
    getMentorDetails: (id: string) => Promise<IMentor | null>;
    approveMentorRequest: (id: string) => Promise<IMentor | null>;
    rejectMentorRequest: (id: string) => Promise<IMentor | null>;
    cancelMentorship: (id: string, options?: {
        session?: ClientSession;
    }) => Promise<IMentor | null>;
    getMentorById: (id: string) => Promise<IMentor | null>;
    getMentorByUserId: (userId: string) => Promise<IMentor | null>;
    updateMentorById: (mentorId: string, updateData: Partial<IMentor>) => Promise<IMentor | null>;
}
//# sourceMappingURL=mentor-repository.d.ts.map