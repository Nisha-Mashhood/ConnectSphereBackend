"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const container_1 = __importDefault(require("../../container"));
const admin_dashboard_routes_1 = require("../Constants/admin-dashboard-routes");
const ratelimit_middleware_1 = require("../../middlewares/ratelimit-middleware");
const multer_1 = require("../../core/utils/multer");
const router = express_1.default.Router();
const authMiddleware = container_1.default.get('IAuthMiddleware');
const adminController = container_1.default.get('IAdminController');
router.get(admin_dashboard_routes_1.ADMIN_DASHBOARD_ROUTES.GetTotalUsers, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getTotalUsersCount);
router.get(admin_dashboard_routes_1.ADMIN_DASHBOARD_ROUTES.GetTotalMentors, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getTotalMentorsCount);
router.get(admin_dashboard_routes_1.ADMIN_DASHBOARD_ROUTES.GetTotalRevenue, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getTotalRevenue);
router.get(admin_dashboard_routes_1.ADMIN_DASHBOARD_ROUTES.GetPendingMentorRequestsCount, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getPendingMentorRequestsCount);
router.get(admin_dashboard_routes_1.ADMIN_DASHBOARD_ROUTES.GetActiveCollaborationsCount, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getActiveCollaborationsCount);
router.get(admin_dashboard_routes_1.ADMIN_DASHBOARD_ROUTES.GetRevenueTrends, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getRevenueTrends);
router.get(admin_dashboard_routes_1.ADMIN_DASHBOARD_ROUTES.GetUserGrowth, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getUserGrowth);
router.get(admin_dashboard_routes_1.ADMIN_DASHBOARD_ROUTES.GetPendingMentorRequests, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getPendingMentorRequests);
router.get(admin_dashboard_routes_1.ADMIN_DASHBOARD_ROUTES.GetTopMentors, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getTopMentors);
router.get(admin_dashboard_routes_1.ADMIN_DASHBOARD_ROUTES.GetRecentCollaborations, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getRecentCollaborations);
router.get(admin_dashboard_routes_1.ADMIN_DASHBOARD_ROUTES.GetAdminDetails, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], adminController.getAdminProfileDetails);
router.put(admin_dashboard_routes_1.ADMIN_DASHBOARD_ROUTES.UpdateAdminDetails, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, multer_1.upload.fields([{ name: 'profilePic', maxCount: 1 }]), authMiddleware.authorize('admin')], adminController.updateAdminDetails);
exports.default = router;
//# sourceMappingURL=admin-dashboard-routes.js.map