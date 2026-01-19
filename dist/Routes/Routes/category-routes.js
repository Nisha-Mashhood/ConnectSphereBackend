"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ratelimit_middleware_1 = require("../../middlewares/ratelimit-middleware");
const multer_1 = require("../../core/utils/multer");
const category_routes_1 = require("../Constants/category-routes");
const container_1 = __importDefault(require("../../container"));
const router = (0, express_1.Router)();
const categoryController = container_1.default.get('ICategoryController');
const authMiddleware = container_1.default.get('IAuthMiddleware');
router.post(category_routes_1.CATEGORY_ROUTES.CreateCategory, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), multer_1.upload.single('image')], categoryController.createCategory);
router.get(category_routes_1.CATEGORY_ROUTES.GetCategories, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], categoryController.getAllCategories);
router.get(category_routes_1.CATEGORY_ROUTES.FetchCategories, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], categoryController.fetchAllCategories);
router.get(category_routes_1.CATEGORY_ROUTES.GetCategory, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.checkBlockedStatus], categoryController.getCategoryById);
router.put(category_routes_1.CATEGORY_ROUTES.UpdateCategory, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin'), multer_1.upload.single('image')], categoryController.updateCategory);
router.delete(category_routes_1.CATEGORY_ROUTES.DeleteCategory, [ratelimit_middleware_1.apiLimiter, authMiddleware.verifyToken, authMiddleware.authorize('admin')], categoryController.deleteCategory);
exports.default = router;
//# sourceMappingURL=category-routes.js.map