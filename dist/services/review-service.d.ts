import { IReviewService } from '../Interfaces/Services/i-review-service';
import { IReviewRepository } from "../Interfaces/Repository/i-review-repositry";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { IReviewDTO } from "../Interfaces/DTOs/i-review-dto";
export declare class ReviewService implements IReviewService {
    private _reviewRepository;
    private _userRepository;
    constructor(reviewRepository: IReviewRepository, userRepository: IUserRepository);
    submitReview: (userId: string, rating: number, comment: string) => Promise<IReviewDTO>;
    skipReview: (userId: string) => Promise<void>;
    getAllReviews: ({ page, limit, search, }: {
        page?: number;
        limit?: number;
        search?: string;
    }) => Promise<{
        reviews: IReviewDTO[];
        total: number;
        page: number;
        pages: number;
    }>;
    approveReview: (reviewId: string) => Promise<IReviewDTO | null>;
    selectReview: (reviewId: string) => Promise<IReviewDTO | null>;
    cancelApproval: (reviewId: string) => Promise<IReviewDTO | null>;
    deselectReview: (reviewId: string) => Promise<IReviewDTO | null>;
    getSelectedReviews: () => Promise<IReviewDTO[]>;
}
//# sourceMappingURL=review-service.d.ts.map