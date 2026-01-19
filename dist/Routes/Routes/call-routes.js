"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ratelimit_middleware_1 = require("../../middlewares/ratelimit-middleware");
const call_routes_1 = require("../Constants/call-routes");
const container_1 = __importDefault(require("../../container"));
const router = express_1.default.Router();
const callController = container_1.default.get('ICallController');
const authMiddleware = container_1.default.get('IAuthMiddleware');
router.get(call_routes_1.CALL_LOG_ROUTES.getCallLogByUSerId, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], callController.getCallLogsByUserId.bind(callController));
exports.default = router;
//# sourceMappingURL=call-routes.js.map