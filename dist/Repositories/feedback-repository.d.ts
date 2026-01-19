import { BaseRepository } from '../core/repositries/base-repositry';
import { IFeedback } from '../Interfaces/Models/i-feedback';
import { IFeedbackRepository } from '../Interfaces/Repository/i-feedback-repositry';
export declare class FeedbackRepository extends BaseRepository<IFeedback> implements IFeedbackRepository {
    constructor();
    private toObjectId;
    createFeedback: (feedbackData: Partial<IFeedback>) => Promise<IFeedback>;
    getFeedbacksByMentorId: (mentorId: string) => Promise<IFeedback[]>;
    getFeedbacksByUserId: (userId: string) => Promise<IFeedback[]>;
    getFeedbackByCollaborationId: (collaborationId: string) => Promise<IFeedback[]>;
    getMentorAverageRating: (mentorId: string) => Promise<number>;
    getFeedbackForProfile: (profileId: string, profileType: "mentor" | "user") => Promise<IFeedback[]>;
    toggleIsHidden: (feedbackId: string) => Promise<IFeedback | null>;
}
//# sourceMappingURL=feedback-repository.d.ts.map