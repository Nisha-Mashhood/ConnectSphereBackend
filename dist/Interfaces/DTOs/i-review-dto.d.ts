import { IUserDTO } from './i-user-dto';
export interface IReviewDTO {
    id: string;
    reviewId: string;
    userId: string;
    user?: IUserDTO;
    rating: number;
    comment: string;
    isApproved: boolean;
    isSelect: boolean;
    createdAt: Date;
}
//# sourceMappingURL=i-review-dto.d.ts.map