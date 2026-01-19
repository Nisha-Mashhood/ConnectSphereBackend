"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ratelimit_middleware_1 = require("../../middlewares/ratelimit-middleware");
const multer_1 = require("../../core/utils/multer");
const group_routes_1 = require("../Constants/group-routes");
const container_1 = __importDefault(require("../../container"));
const router = express_1.default.Router();
const groupController = container_1.default.get('IGroupController');
const authMiddleware = container_1.default.get('IAuthMiddleware');
router.post(group_routes_1.GROUP_ROUTES.CreateGroup, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], groupController.createGroup.bind(groupController));
router.get(group_routes_1.GROUP_ROUTES.FetchGroups, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], groupController.getGroupDetails.bind(groupController));
router.get(group_routes_1.GROUP_ROUTES.GetGroupById, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], groupController.getGroupById.bind(groupController));
router.get(group_routes_1.GROUP_ROUTES.GetAllGroups, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], groupController.getAllGroups.bind(groupController));
router.post(group_routes_1.GROUP_ROUTES.SendGroupRequest, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], groupController.sendGroupRequest.bind(groupController));
router.get(group_routes_1.GROUP_ROUTES.GetGroupRequestsByGroupId, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], groupController.getGroupRequestsByGroupId.bind(groupController));
router.get(group_routes_1.GROUP_ROUTES.GetGroupRequestsByAdminId, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], groupController.getGroupRequestsByAdminId.bind(groupController));
router.get(group_routes_1.GROUP_ROUTES.GetGroupRequestsByUserId, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], groupController.getGroupRequestsByUserId.bind(groupController));
router.put(group_routes_1.GROUP_ROUTES.UpdateGroupRequest, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], groupController.updateGroupRequest.bind(groupController));
router.post(group_routes_1.GROUP_ROUTES.ProcessPayment, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], groupController.makeStripePayment.bind(groupController));
router.delete(group_routes_1.GROUP_ROUTES.RemoveMember, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], groupController.removeGroupMember.bind(groupController));
router.delete(group_routes_1.GROUP_ROUTES.RemoveGroup, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], groupController.deleteGroup.bind(groupController));
router.put(group_routes_1.GROUP_ROUTES.UploadGroupPicture, [
    ratelimit_middleware_1.apiLimiter,
    authMiddleware.verifyToken,
    authMiddleware.checkBlockedStatus,
    multer_1.upload.fields([
        { name: "profilePic", maxCount: 1 },
        { name: "coverPic", maxCount: 1 },
    ]),
], groupController.updateGroupImage.bind(groupController));
router.get(group_routes_1.GROUP_ROUTES.GetGroupDetailsForMembers, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], groupController.getGroupDetailsForMembers.bind(groupController));
router.get(group_routes_1.GROUP_ROUTES.GetGroupRequestById, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], groupController.getGroupRequestById.bind(groupController));
router.get(group_routes_1.GROUP_ROUTES.GetAllGroupRequests, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize("admin")], groupController.getAllGroupRequests.bind(groupController));
exports.default = router;
//# sourceMappingURL=group-routes.js.map