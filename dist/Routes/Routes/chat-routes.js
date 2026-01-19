"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const container_1 = __importDefault(require("../../container"));
const chat_routes_1 = require("../Constants/chat-routes");
const multer_1 = require("../../core/utils/multer");
const ratelimit_middleware_1 = require("../../middlewares/ratelimit-middleware");
const router = (0, express_1.Router)();
const chatController = container_1.default.get('IChatController');
const authMiddleware = container_1.default.get('IAuthMiddleware');
router.get(chat_routes_1.CHAT_ROUTES.GetMessages, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], chatController.getChatMessages);
router.post(chat_routes_1.CHAT_ROUTES.UploadMessage, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus, multer_1.upload.single('file')], chatController.uploadAndSaveMessage);
router.get(chat_routes_1.CHAT_ROUTES.GetUnreadCounts, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], chatController.getUnreadMessageCounts);
router.get(chat_routes_1.CHAT_ROUTES.GetLastMessages, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], chatController.getLastMessageSummaries);
exports.default = router;
//# sourceMappingURL=chat-routes.js.map