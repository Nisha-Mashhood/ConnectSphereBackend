"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ratelimit_middleware_1 = require("../../middlewares/ratelimit-middleware");
const contact_routes_1 = require("../Constants/contact-routes");
const container_1 = __importDefault(require("../../container"));
const router = (0, express_1.Router)();
const contactController = container_1.default.get('IContactController');
const authMiddleware = container_1.default.get('IAuthMiddleware');
router.get(contact_routes_1.CONTACT_ROUTES.GetUserContacts, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], contactController.getUserContacts);
exports.default = router;
//# sourceMappingURL=contact-routes.js.map