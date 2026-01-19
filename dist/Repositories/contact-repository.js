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
exports.ContactRepository = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const contacts_model_1 = __importDefault(require("../Models/contacts-model"));
const status_code_enums_1 = require("../enums/status-code-enums");
let ContactRepository = class ContactRepository extends base_repositry_1.BaseRepository {
    constructor(chatRepository) {
        super(contacts_model_1.default);
        this.toObjectId = (id) => {
            if (!id) {
                logger_1.default.warn('Missing ID when converting to ObjectId');
                throw new error_handler_1.RepositoryError('Invalid ID: ID is required', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            const idStr = id instanceof mongoose_1.Types.ObjectId ? id.toString() : id;
            if (!mongoose_1.Types.ObjectId.isValid(idStr)) {
                logger_1.default.warn(`Invalid ObjectId format: ${idStr}`);
                throw new error_handler_1.RepositoryError('Invalid ID: must be a 24 character hex string', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            return new mongoose_1.Types.ObjectId(idStr);
        };
        this.createContact = async (contactData, session) => {
            try {
                logger_1.default.debug(`Creating contact for user: ${contactData.userId}`);
                const contact = await this.create({
                    ...contactData,
                    userId: contactData.userId ? this.toObjectId(contactData.userId) : undefined,
                    targetUserId: contactData.targetUserId ? this.toObjectId(contactData.targetUserId) : undefined,
                    collaborationId: contactData.collaborationId ? this.toObjectId(contactData.collaborationId) : undefined,
                    userConnectionId: contactData.userConnectionId ? this.toObjectId(contactData.userConnectionId) : undefined,
                    groupId: contactData.groupId ? this.toObjectId(contactData.groupId) : undefined,
                }, session);
                logger_1.default.info(`Contact created: ${contact._id}`);
                return contact;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating contact`, err);
                throw new error_handler_1.RepositoryError('Error creating contact', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findContactById = async (contactId) => {
            try {
                logger_1.default.debug(`Finding contact by ID: ${contactId}`);
                const contact = await this.findById(contactId);
                logger_1.default.info(`Contact ${contact ? 'found' : 'not found'}: ${contactId}`);
                return contact;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error finding contact by ID ${contactId}`, err);
                throw new error_handler_1.RepositoryError('Error finding contact by ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findContactByUsers = async (userId, targetUserId) => {
            try {
                logger_1.default.debug(`Finding contact for users: ${userId}, ${targetUserId}`);
                const contact = await this.findOne({
                    $or: [
                        { userId: this.toObjectId(userId), targetUserId: this.toObjectId(targetUserId) },
                        { userId: this.toObjectId(targetUserId), targetUserId: this.toObjectId(userId) },
                    ],
                    type: { $in: ['user-user', 'user-mentor'] },
                });
                logger_1.default.info(`Contact ${contact ? 'found' : 'not found'} for users: ${userId}, ${targetUserId}`);
                return contact;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error finding contact for users ${userId}, ${targetUserId}`, err);
                throw new error_handler_1.RepositoryError('Error finding contact by user IDs', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findContactsByUserId = async (userId) => {
            if (!userId) {
                logger_1.default.warn('User ID not provided for finding contacts');
                throw new error_handler_1.RepositoryError('User ID not provided', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            try {
                logger_1.default.debug(`Finding contacts for user: ${userId}`);
                const uId = this.toObjectId(userId);
                const contacts = await this.model
                    .find({
                    $or: [{ userId: uId }, { targetUserId: uId }],
                })
                    .populate({
                    path: 'userId',
                    select: '_id name profilePic userId jobTitle',
                    model: 'User',
                })
                    .populate({
                    path: 'targetUserId',
                    select: '_id name profilePic userId jobTitle',
                    model: 'User',
                })
                    .populate({
                    path: 'collaborationId',
                    select: '_id mentorId userId startDate endDate price selectedSlot',
                    model: 'Collaboration',
                    populate: [
                        { path: 'mentorId', select: 'userId', populate: { path: 'userId', select: '_id name profilePic jobTitle' } },
                        { path: 'userId', select: '_id name profilePic jobTitle' },
                    ],
                })
                    .populate({
                    path: 'userConnectionId',
                    select: '_id requester recipient requestAcceptedAt',
                    model: 'UserConnection',
                    populate: [
                        { path: 'requester', select: '_id name profilePic jobTitle' },
                        { path: 'recipient', select: '_id name profilePic jobTitle' },
                    ],
                })
                    .populate({
                    path: 'groupId',
                    select: '_id name profilePic startDate adminId bio price maxMembers availableSlots members',
                    model: 'Group',
                    populate: [
                        { path: 'adminId', select: '_id name profilePic' },
                        { path: 'members.userId', select: '_id name profilePic' },
                    ],
                })
                    .lean()
                    .exec();
                const contactsWithMessages = await Promise.all(contacts.map(async (contact) => {
                    let lastMessage = null;
                    if (contact.type === 'group' && contact.groupId?._id) {
                        lastMessage = await this._chatRepo.findLatestMessageByGroupId(contact.groupId._id.toString());
                    }
                    else if (contact.type === 'user-mentor' && contact.collaborationId?._id) {
                        lastMessage = await this._chatRepo.findLatestMessageByCollaborationId(contact.collaborationId._id.toString());
                    }
                    else if (contact.type === 'user-user' && contact.userConnectionId?._id) {
                        lastMessage = await this._chatRepo.findLatestMessageByUserConnectionId(contact.userConnectionId._id.toString());
                    }
                    return { ...contact, lastMessage: lastMessage || undefined };
                }));
                const sortedContacts = contactsWithMessages.sort((a, b) => {
                    const aTimestamp = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
                    const bTimestamp = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
                    return bTimestamp - aTimestamp || a._id.toString().localeCompare(b._id.toString());
                });
                return sortedContacts;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error finding contacts for user ${userId}`, err);
                throw new error_handler_1.RepositoryError('Error finding contacts by user ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteContact = async (id, type, userId) => {
            try {
                logger_1.default.debug(`Deleting contact for id: ${id}, type: ${type}${userId ? `, userId: ${userId}` : ''}`);
                const query = { type };
                if (type === 'group') {
                    query.groupId = this.toObjectId(id);
                    if (userId) {
                        query.userId = this.toObjectId(userId);
                    }
                }
                else if (type === 'user-mentor') {
                    query.collaborationId = this.toObjectId(id);
                }
                else if (type === 'user-user') {
                    query.userConnectionId = this.toObjectId(id);
                }
                else {
                    logger_1.default.warn(`Invalid contact type: ${type}`);
                    throw new error_handler_1.RepositoryError(`Invalid contact type: ${type}`, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const result = await this.model.deleteMany(query).exec();
                const deletedCount = result.deletedCount || 0;
                logger_1.default.info(`Deleted ${deletedCount} contact(s) for id: ${id}, type: ${type}${userId ? `, userId: ${userId}` : ''}`);
                return deletedCount;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting contact for id: ${id}, type: ${type}`, err);
                throw new error_handler_1.RepositoryError('Error deleting contact', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._chatRepo = chatRepository;
    }
};
exports.ContactRepository = ContactRepository;
exports.ContactRepository = ContactRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IChatRepository')),
    __metadata("design:paramtypes", [Object])
], ContactRepository);
//# sourceMappingURL=contact-repository.js.map