"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Define storage for multer
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "uploads/");
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
// File type validation
const fileFilter = (_req, file, cb) => {
    const allowedFileTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "video/mp4",
        "application/pdf",
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
    ];
    const mimetype = allowedFileTypes.includes(file.mimetype);
    const extname = allowedFileTypes.some(type => path_1.default.extname(file.originalname).toLowerCase() === `.${type.split("/")[1]}`);
    if (mimetype && extname) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Only JPEG, JPG, PNG, MP4, PDF, DOC, and DOCX are allowed."), false);
    }
};
// Multer configuration
const multerInstance = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});
// Custom error-handling wrapper for Multer
const createMulterMiddleware = (multerMethod) => {
    return (req, res, next) => {
        multerMethod(req, res, (err) => {
            if (err instanceof multer_1.default.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.message || "File upload error",
                    data: '',
                });
            }
            else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || "An error occurred during file upload",
                    data: '',
                });
            }
            return next();
        });
    };
};
// Export wrapped Multer methods to match original usage in routes
exports.upload = {
    fields: (fields) => createMulterMiddleware(multerInstance.fields(fields)),
    single: (fieldName) => createMulterMiddleware(multerInstance.single(fieldName)),
    array: (fieldName, maxCount) => createMulterMiddleware(multerInstance.array(fieldName, maxCount)),
    any: () => createMulterMiddleware(multerInstance.any()),
};
//# sourceMappingURL=multer.js.map