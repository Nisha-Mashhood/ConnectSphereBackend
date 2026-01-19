"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ratelimit_middleware_1 = require("../../middlewares/ratelimit-middleware");
const review_routes_1 = require("../Constants/review-routes");
const container_1 = __importDefault(require("../../container"));
const router = express_1.default.Router();
const reviewController = container_1.default.get('IReviewController');
const authMiddleware = container_1.default.get('IAuthMiddleware');
router.post(review_routes_1.REVIEW_ROUTES.SubmitReview, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], reviewController.submitReview.bind(reviewController));
router.post(review_routes_1.REVIEW_ROUTES.SkipReview, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], reviewController.skipReview.bind(reviewController));
router.get(review_routes_1.REVIEW_ROUTES.GetAllReviews, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], reviewController.getAllReviews.bind(reviewController));
router.patch(review_routes_1.REVIEW_ROUTES.ApproveReview, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], reviewController.approveReview.bind(reviewController));
router.patch(review_routes_1.REVIEW_ROUTES.SelectReview, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], reviewController.selectReview.bind(reviewController));
router.get(review_routes_1.REVIEW_ROUTES.GetSelectedReviews, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], reviewController.getSelectedReviews.bind(reviewController));
router.patch(review_routes_1.REVIEW_ROUTES.CancelApproval, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], reviewController.cancelApproval.bind(reviewController));
router.patch(review_routes_1.REVIEW_ROUTES.DeselectReview, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], reviewController.deselectReview.bind(reviewController));
exports.default = router;
//# sourceMappingURL=review-routes.js.map