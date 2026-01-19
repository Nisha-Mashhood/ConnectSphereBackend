import { Document, Types } from "mongoose";
export interface IChatMessage extends Document {
    _id: Types.ObjectId;
    ChatId: string;
    senderId: Types.ObjectId | string;
    content: string;
    thumbnailUrl?: string;
    collaborationId?: Types.ObjectId | string;
    userConnectionId?: Types.ObjectId | string;
    groupId?: Types.ObjectId | string;
    contentType: "text" | "image" | "video" | "file";
    fileMetadata?: {
        fileName: string | undefined;
        fileSize: number | undefined;
        mimeType: string | undefined;
    };
    isRead: boolean;
    status: "pending" | "sent" | "read";
    timestamp: Date;
}
//# sourceMappingURL=i-chat-message.d.ts.map