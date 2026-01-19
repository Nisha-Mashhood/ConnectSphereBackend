import { IUserDTO } from './i-user-dto';
import { IMentorDTO } from './i-mentor-dto';
import { ICollaborationDTO } from './i-collaboration-dto';
export interface IFeedbackDTO {
    id: string;
    feedbackId: string;
    userId: string;
    user?: IUserDTO;
    mentorId: string;
    mentor?: IMentorDTO;
    collaborationId: string;
    collaboration?: ICollaborationDTO;
    givenBy: "user" | "mentor";
    rating: number;
    communication: number;
    expertise: number;
    punctuality: number;
    comments: string;
    wouldRecommend: boolean;
    isHidden: boolean;
    createdAt: Date;
}
//# sourceMappingURL=i-feedback-dto.d.ts.map