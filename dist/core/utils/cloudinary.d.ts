export declare const uploadMedia: (filePath: string, folder?: string, fileSize?: number, contentType?: "image" | "video" | "file") => Promise<{
    url: string;
    thumbnailUrl: string | undefined;
    publicId: string;
    version: number;
}>;
export declare const generateCloudinaryUrl: (publicId: string, folder?: string, options?: {
    width?: number;
    height?: number;
    crop?: string;
    format?: string;
    resourceType?: "image" | "video" | "auto";
    version?: number;
}) => string;
//# sourceMappingURL=cloudinary.d.ts.map