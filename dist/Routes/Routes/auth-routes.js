"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("../Constants/auth-routes");
const container_1 = __importDefault(require("../../container"));
const ratelimit_middleware_1 = require("../../middlewares/ratelimit-middleware");
const multer_1 = require("../../core/utils/multer");
const router = express_1.default.Router();
const authController = container_1.default.get('IAuthController');
const authMiddleware = container_1.default.get('IAuthMiddleware');
// Public routes
router.post(auth_routes_1.AUTH_ROUTES.Register, ratelimit_middleware_1.authLimiter, authController.signup.bind(authController));
router.post(auth_routes_1.AUTH_ROUTES.Login, ratelimit_middleware_1.authLimiter, authController.login.bind(authController));
router.post(auth_routes_1.AUTH_ROUTES.ForgotPassword, ratelimit_middleware_1.authLimiter, authController.handleForgotPassword.bind(authController));
router.post(auth_routes_1.AUTH_ROUTES.VerifyOTP, ratelimit_middleware_1.authLimiter, authController.handleVerifyOTP.bind(authController));
router.post(auth_routes_1.AUTH_ROUTES.ResentOTP, ratelimit_middleware_1.authLimiter, authController.resendOtp.bind(authController));
router.post(auth_routes_1.AUTH_ROUTES.ResetPassword, ratelimit_middleware_1.authLimiter, authController.handleResetPassword.bind(authController));
router.post(auth_routes_1.AUTH_ROUTES.GoogleSignup, ratelimit_middleware_1.authLimiter, authController.googleSignup.bind(authController));
router.post(auth_routes_1.AUTH_ROUTES.GoogleLogin, ratelimit_middleware_1.authLimiter, authController.googleLogin.bind(authController));
router.post(auth_routes_1.AUTH_ROUTES.GithubSignup, ratelimit_middleware_1.authLimiter, authController.githubSignup.bind(authController));
router.post(auth_routes_1.AUTH_ROUTES.GithubLogin, ratelimit_middleware_1.authLimiter, authController.githubLogin.bind(authController));
// Protected routes
router.post(auth_routes_1.AUTH_ROUTES.VerifyAdminPasskey, [ratelimit_middleware_1.authLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], authController.verifyPasskey.bind(authController));
router.post(auth_routes_1.AUTH_ROUTES.RefreshToken, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyRefreshToken], authController.refreshToken.bind(authController));
router.post(auth_routes_1.AUTH_ROUTES.Logout, [ratelimit_middleware_1.apiLimiter], authController.logout.bind(authController));
// Protected user routes
router.get(auth_routes_1.AUTH_ROUTES.CheckProfile, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], authController.checkProfile.bind(authController));
router.get(auth_routes_1.AUTH_ROUTES.ProfileDetails, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], authController.getProfileDetails.bind(authController));
router.put(auth_routes_1.AUTH_ROUTES.UpdateUserDetails, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, multer_1.upload.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'coverPic', maxCount: 1 }])], authController.updateUserDetails.bind(authController));
router.get(auth_routes_1.AUTH_ROUTES.GetAllUsers, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken], authController.getAllUsers.bind(authController));
router.get(auth_routes_1.AUTH_ROUTES.FetchAllUsers, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], authController.fetchAllUsers.bind(authController));
router.get(auth_routes_1.AUTH_ROUTES.GetUser, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken], authController.getUserById.bind(authController));
router.put(auth_routes_1.AUTH_ROUTES.UpdateUser, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, multer_1.upload.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'coverPic', maxCount: 1 }])], authController.updateUserDetails.bind(authController));
router.put(auth_routes_1.AUTH_ROUTES.UpdatePassword, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], authController.updatePassword.bind(authController));
router.put(auth_routes_1.AUTH_ROUTES.BlockUser, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], authController.blockUser.bind(authController));
router.put(auth_routes_1.AUTH_ROUTES.UnblockUser, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], authController.unblockUser.bind(authController));
router.put(auth_routes_1.AUTH_ROUTES.ChangeRole, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], authController.changeRole.bind(authController));
exports.default = router;
//# sourceMappingURL=auth-routes.js.map