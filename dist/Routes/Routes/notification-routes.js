"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ratelimit_middleware_1 = require("../../middlewares/ratelimit-middleware");
const notification_routes_1 = require("../Constants/notification-routes");
const container_1 = __importDefault(require("../../container"));
const router = express_1.default.Router();
const notificationController = container_1.default.get('INotificationController');
const authMiddleware = container_1.default.get('IAuthMiddleware');
router.get(notification_routes_1.NOTIFICATION_ROUTES.GetNotifications, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken], notificationController.getNotifications.bind(notificationController));
router.patch(notification_routes_1.NOTIFICATION_ROUTES.MarkAsRead, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken], notificationController.markAsRead.bind(notificationController));
router.get(notification_routes_1.NOTIFICATION_ROUTES.GetUnreadCount, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken], notificationController.getUnreadCount.bind(notificationController));
exports.default = router;
//# sourceMappingURL=notification-routes.js.map