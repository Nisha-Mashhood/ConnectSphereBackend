"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const container_1 = __importDefault(require("../../container"));
const contact_us_routes_1 = require("../Constants/contact-us-routes");
const ratelimit_middleware_1 = require("../../middlewares/ratelimit-middleware");
const router = express_1.default.Router();
const contactMessageController = container_1.default.get('IContactMessageController');
const authMiddleware = container_1.default.get('IAuthMiddleware');
router.post(contact_us_routes_1.CONTACT_ROUTES.CreateContactMessage, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], contactMessageController.createContactMessage.bind(contactMessageController));
router.get(contact_us_routes_1.CONTACT_ROUTES.GetAllContactMessages, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], contactMessageController.getAllContactMessages.bind(contactMessageController));
router.post(contact_us_routes_1.CONTACT_ROUTES.SendReply, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], contactMessageController.sendReply.bind(contactMessageController));
exports.default = router;
//# sourceMappingURL=contact-us-routes.js.map