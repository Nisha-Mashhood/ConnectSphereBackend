"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveImage = resolveImage;
const logger_1 = __importDefault(require("../../../core/utils/logger"));
const cloudinary_1 = require("../../../core/utils/cloudinary");
function resolveImage(value, folder) {
    if (!value)
        return undefined;
    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }
    const url = (0, cloudinary_1.generateCloudinaryUrl)(value, folder, { width: 200, height: 200 });
    logger_1.default.info("The cloudinary url for the image is : ", url);
    return url;
}
//# sourceMappingURL=image-resolver.js.map