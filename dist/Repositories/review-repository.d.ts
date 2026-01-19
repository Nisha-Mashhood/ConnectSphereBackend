import { BaseRepository } from '../core/repositries/base-repositry';
import { IReview } from '../Interfaces/Models/i-review';
import { IReviewRepository } from '../Interfaces/Repository/i-review-repositry';
export declare class ReviewRepository extends BaseRepository<IReview> implements IReviewRepository {
    constructor();
    private toObjectId;
    createReview: (data: {
        userId: string;
        rating: number;
        comment: string;
    }) => Promise<IReview>;
    findReviewById: (reviewId: string) => Promise<IReview | null>;
    getAllReviews({ page, limit, search, }: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        reviews: IReview[];
        total: number;
        page: number;
        pages: number;
    }>;
    updateReview: (reviewId: string, updates: {
        isApproved?: boolean;
        isSelect?: boolean;
    }) => Promise<IReview | null>;
    getSelectedReviews: () => Promise<IReview[]>;
}
//# sourceMappingURL=review-repository.d.ts.map