"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const inversify_1 = require("inversify");
const base_controller_1 = require("../core/controller/base-controller");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const error_messages_1 = require("../constants/error-messages");
const messages_1 = require("../constants/messages");
let ContactController = class ContactController extends base_controller_1.BaseController {
    constructor(contactService) {
        super();
        this.getUserContacts = async (req, res, next) => {
            try {
                const userId = req.currentUser?._id;
                const userRole = req.currentUser?.role;
                if (!userId || !userRole) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID_OR_ROLE, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const contacts = await this._contactService.getUserContacts(userId?.toString());
                if (contacts.length === 0) {
                    this.sendSuccess(res, [], messages_1.CONTACT_MESSAGES.NO_CONTACTS_FOUND);
                    logger_1.default.info(`No contacts found for userId: ${userId}`);
                    return;
                }
                this.sendSuccess(res, contacts, messages_1.CONTACT_MESSAGES.CONTACTS_RETRIEVED);
            }
            catch (error) {
                logger_1.default.error(`Error in getUserContacts: ${error.message}`);
                next(error);
            }
        };
        this._contactService = contactService;
    }
};
exports.ContactController = ContactController;
exports.ContactController = ContactController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IContactService')),
    __metadata("design:paramtypes", [Object])
], ContactController);
//# sourceMappingURL=contact-controller.js.map