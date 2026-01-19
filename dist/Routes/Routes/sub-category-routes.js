"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ratelimit_middleware_1 = require("../../middlewares/ratelimit-middleware");
const multer_1 = require("../../core/utils/multer");
const sub_category_routes_1 = require("../Constants/sub-category-routes");
const container_1 = __importDefault(require("../../container"));
const router = (0, express_1.Router)();
const subcategoryController = container_1.default.get('ISubCategoryController');
const authMiddleware = container_1.default.get('IAuthMiddleware');
router.post(sub_category_routes_1.SUBCATEGORY_ROUTES.CreateSubcategory, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), multer_1.upload.single('image')], subcategoryController.createSubcategory);
router.get(sub_category_routes_1.SUBCATEGORY_ROUTES.GetSubcategories, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], subcategoryController.getAllSubcategories);
router.get(sub_category_routes_1.SUBCATEGORY_ROUTES.GetSubcategoryById, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], subcategoryController.getSubcategoryById);
router.put(sub_category_routes_1.SUBCATEGORY_ROUTES.UpdateSubcategory, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), multer_1.upload.single('image')], subcategoryController.updateSubcategory);
router.delete(sub_category_routes_1.SUBCATEGORY_ROUTES.DeleteSubcategory, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], subcategoryController.deleteSubcategory);
exports.default = router;
//# sourceMappingURL=sub-category-routes.js.map