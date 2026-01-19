"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCloudinaryUrl = exports.uploadMedia = void 0;
const cloudinary_1 = require("cloudinary");
const env_config_1 = __importDefault(require("../../config/env-config"));
const promises_1 = __importDefault(require("fs/promises"));
cloudinary_1.v2.config({
    cloud_name: env_config_1.default.cloudinaryCloudName,
    api_key: env_config_1.default.cloudinaryApiKey,
    api_secret: env_config_1.default.cloudinaryApiSecret,
});
const uploadMedia = async (filePath, folder, fileSize = 0, contentType) => {
    const maxSize = 10 * 1024 * 1024;
    try {
        const baseTransformations = fileSize > maxSize
            ? [
                { width: 1024, height: 1024, crop: "limit" }, // Images/videos: max 1024x1024
                { quality: "auto:low" }, // Reduce quality for images/videos
                { fetch_format: "auto" }, // Optimize format
            ]
            : [
                { width: 1024, height: 1024, crop: "limit" }, // Still limit size
                { quality: "auto" }, // Default optimization
                { fetch_format: "auto" },
            ];
        let uploadOptions = {
            folder,
            resource_type: "auto",
            transformation: baseTransformations,
        };
        if (contentType === "video") {
            uploadOptions.eager = baseTransformations;
            uploadOptions.eager_async = true;
        }
        const result = await cloudinary_1.v2.uploader.upload(filePath, uploadOptions);
        //For thumbnail
        let thumbnailUrl;
        if (contentType === "video") {
            thumbnailUrl = cloudinary_1.v2.url(result.public_id, {
                resource_type: "video",
                transformation: [
                    { width: 200, height: 200, crop: "fill" },
                    { fetch_format: "jpg" },
                ],
            });
        }
        else if (contentType === "file") {
            thumbnailUrl = cloudinary_1.v2.url(result.public_id, {
                resource_type: "image",
                transformation: [
                    { width: 200, height: 200, crop: "fill" },
                    { fetch_format: "jpg" },
                    { default_image: "file_thumbnail.jpg" },
                ],
            });
        }
        await promises_1.default.unlink(filePath); // Remove the file from local storage
        console.log(`Deleted local file: ${filePath}`);
        return { url: result.secure_url, thumbnailUrl, publicId: result.public_id, version: result.version };
    }
    catch (error) {
        console.error(`Failed to upload image or delete file: ${filePath}`, error);
        throw error;
    }
};
exports.uploadMedia = uploadMedia;
const generateCloudinaryUrl = (publicId, folder, options = {}) => {
    const { width, height, crop, format, resourceType = "image", version } = options;
    // Construct the full ID (folder + publicId)
    const fullPublicId = folder && !publicId.startsWith(`${folder}/`)
        ? `${folder}/${publicId}`
        : publicId;
    return cloudinary_1.v2.url(fullPublicId, {
        secure: true,
        version,
        resource_type: resourceType,
        transformation: [
            ...(width && height ? [{ width, height, crop: crop || "fill" }] : []),
            ...(format ? [{ fetch_format: format }] : []),
        ],
    });
};
exports.generateCloudinaryUrl = generateCloudinaryUrl;
//# sourceMappingURL=cloudinary.js.map