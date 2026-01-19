"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ratelimit_middleware_1 = require("../../middlewares/ratelimit-middleware");
const user_collaboration_routes_1 = require("../Constants/user-collaboration-routes");
const container_1 = __importDefault(require("../../container"));
const router = express_1.default.Router();
const userConnectionController = container_1.default.get('IUserConnectionController');
const authMiddleware = container_1.default.get('IAuthMiddleware');
router.post(user_collaboration_routes_1.USER_CONNECTION_ROUTES.SendUserRequest, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], userConnectionController.sendRequest.bind(userConnectionController));
router.put(user_collaboration_routes_1.USER_CONNECTION_ROUTES.RespondToRequest, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], userConnectionController.respondToRequest.bind(userConnectionController));
router.put(user_collaboration_routes_1.USER_CONNECTION_ROUTES.DisconnectConnection, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], userConnectionController.disconnectConnection.bind(userConnectionController));
router.get(user_collaboration_routes_1.USER_CONNECTION_ROUTES.GetUserConnections, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], userConnectionController.getUserConnections.bind(userConnectionController));
router.get(user_collaboration_routes_1.USER_CONNECTION_ROUTES.GetUserRequests, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], userConnectionController.getUserRequests.bind(userConnectionController));
router.get(user_collaboration_routes_1.USER_CONNECTION_ROUTES.GetConnectionById, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], userConnectionController.getUserConnectionById.bind(userConnectionController));
router.get(user_collaboration_routes_1.USER_CONNECTION_ROUTES.GetAllConnections, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], userConnectionController.getAllUserConnections.bind(userConnectionController));
exports.default = router;
//# sourceMappingURL=user-collaboration-routes.js.map