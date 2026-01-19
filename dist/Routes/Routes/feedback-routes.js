"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const container_1 = __importDefault(require("../../container"));
const feedback_routes_1 = require("../Constants/feedback-routes");
const ratelimit_middleware_1 = require("../../middlewares/ratelimit-middleware");
const router = express_1.default.Router();
const feedbackController = container_1.default.get('IFeedBackController');
const authMiddleware = container_1.default.get('IAuthMiddleware');
router.post(feedback_routes_1.FEEDBACK_ROUTES.SendFeedback, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.createFeedback.bind(feedbackController));
router.get(feedback_routes_1.FEEDBACK_ROUTES.GetFeedbackForProfile, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.getFeedbackForProfile.bind(feedbackController));
router.get(feedback_routes_1.FEEDBACK_ROUTES.GetFeedbackByCollabId, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.getFeedbackByCollaborationId.bind(feedbackController));
router.patch(feedback_routes_1.FEEDBACK_ROUTES.ToggleVisibility, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], feedbackController.toggleFeedback.bind(feedbackController));
router.get(feedback_routes_1.FEEDBACK_ROUTES.GetFeedbackByMentorId, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.getFeedbackByMentorId.bind(feedbackController));
router.get(feedback_routes_1.FEEDBACK_ROUTES.GetMentorFeedbacks, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.getMentorFeedbacks.bind(feedbackController));
router.get(feedback_routes_1.FEEDBACK_ROUTES.GetUserFeedbacks, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], feedbackController.getUserFeedbacks.bind(feedbackController));
exports.default = router;
//# sourceMappingURL=feedback-routes.js.map