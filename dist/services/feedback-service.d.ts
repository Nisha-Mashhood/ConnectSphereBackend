import { IFeedback } from '../Interfaces/Models/i-feedback';
import { IFeedbackService } from '../Interfaces/Services/i-feedback-service';
import { IFeedbackRepository } from "../Interfaces/Repository/i-feedback-repositry";
import { ICollaborationRepository } from "../Interfaces/Repository/i-collaboration-repositry";
import { IFeedbackDTO } from "../Interfaces/DTOs/i-feedback-dto";
export declare class FeedbackService implements IFeedbackService {
    private _feedbackRepository;
    private _collabRepository;
    constructor(feedbackRepository: IFeedbackRepository, collaborationrepository: ICollaborationRepository);
    createFeedback: (feedbackData: Partial<IFeedback>) => Promise<IFeedbackDTO>;
    getMentorFeedbacks: (mentorId: string) => Promise<{
        feedbacks: IFeedbackDTO[];
        averageRating: number;
        totalFeedbacks: number;
    }>;
    getUserFeedbacks: (userId: string) => Promise<IFeedbackDTO[]>;
    getFeedbackForProfile: (profileId: string, profileType: "mentor" | "user") => Promise<{
        feedbacks: IFeedbackDTO[];
        totalFeedbacks: number;
    }>;
    getFeedbackByCollaborationId: (collabId: string) => Promise<IFeedbackDTO[]>;
    toggleFeedback: (feedbackId: string) => Promise<IFeedbackDTO>;
    getFeedbackByMentorId: (mentorId: string) => Promise<IFeedbackDTO[]>;
}
//# sourceMappingURL=feedback-service.d.ts.map