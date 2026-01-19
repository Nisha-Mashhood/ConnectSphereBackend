import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/controller/base-controller';
import { IChatController } from '../Interfaces/Controller/i-chat-controller';
import { IChatService } from '../Interfaces/Services/i-chat-service';
export declare class ChatController extends BaseController implements IChatController {
    private _chatService;
    constructor(chatService: IChatService);
    getChatMessages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    uploadAndSaveMessage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUnreadMessageCounts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getLastMessageSummaries: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=chat-controller.d.ts.map