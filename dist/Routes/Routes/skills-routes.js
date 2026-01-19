"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ratelimit_middleware_1 = require("../../middlewares/ratelimit-middleware");
const multer_1 = require("../../core/utils/multer");
const skills_routes_1 = require("../Constants/skills-routes");
const container_1 = __importDefault(require("../../container"));
const router = (0, express_1.Router)();
const skillsController = container_1.default.get('ISkillsController');
const authMiddleware = container_1.default.get('IAuthMiddleware');
router.post(skills_routes_1.SKILLS_ROUTES.CreateSkill, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), multer_1.upload.single('image')], skillsController.createSkill);
router.get(skills_routes_1.SKILLS_ROUTES.GetSkillsBySubcategory, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], skillsController.getAllSkills);
router.get(skills_routes_1.SKILLS_ROUTES.GetSkillById, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], skillsController.getSkillById);
router.put(skills_routes_1.SKILLS_ROUTES.UpdateSkill, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), multer_1.upload.single('image')], skillsController.updateSkill);
router.delete(skills_routes_1.SKILLS_ROUTES.DeleteSkill, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], skillsController.deleteSkill);
router.get(skills_routes_1.SKILLS_ROUTES.GetAllSkills, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], skillsController.getSkills);
exports.default = router;
//# sourceMappingURL=skills-routes.js.map