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
exports.ContactService = void 0;
const inversify_1 = require("inversify");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
let ContactService = class ContactService {
    constructor(contactRepository) {
        this.getUserContacts = async (userId) => {
            try {
                if (!userId) {
                    logger_1.default.error("User ID not provided");
                    throw new error_handler_1.ServiceError("User ID not provided", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                logger_1.default.debug(`Fetching contacts for user: ${userId}`);
                const contacts = await this._contactRepository.findContactsByUserId(userId);
                const formattedContacts = contacts.map((contact) => {
                    let targetId = "";
                    let targetName = "Unknown";
                    let targetProfilePic = "";
                    let targetJobTitle;
                    let collaborationId;
                    let collaborationDetails;
                    let userConnectionId;
                    let connectionDetails;
                    let groupId;
                    let groupDetails;
                    const contactUserId = contact.userId._id.toString();
                    const contactTargetId = contact.targetUserId?._id.toString();
                    if (contact.type === "user-mentor" && contact.collaborationId) {
                        if (contactUserId === userId && contactTargetId) {
                            targetId = contactTargetId;
                            targetName = contact.targetUserId?.name || "Unknown";
                            targetProfilePic = contact.targetUserId?.profilePic || "";
                            targetJobTitle = contact.targetUserId?.jobTitle;
                        }
                        else if (contactTargetId === userId && contactUserId) {
                            targetId = contactUserId;
                            targetName = contact.userId?.name || "Unknown";
                            targetProfilePic = contact.userId?.profilePic || "";
                            targetJobTitle = contact.userId?.jobTitle;
                        }
                        collaborationId = contact.collaborationId._id.toString();
                        collaborationDetails = {
                            startDate: contact.collaborationId.startDate,
                            endDate: contact.collaborationId.endDate,
                            price: contact.collaborationId.price,
                            selectedSlot: contact.collaborationId.selectedSlot,
                            mentorName: contact.collaborationId.mentorId.userId.name || "Unknown",
                            mentorProfilePic: contact.collaborationId.mentorId.userId.profilePic || "",
                            mentorJobTitle: contact.collaborationId.mentorId.userId.jobTitle,
                            userName: contact.collaborationId.userId.name || "Unknown",
                            userProfilePic: contact.collaborationId.userId.profilePic || "",
                            userJobTitle: contact.collaborationId.userId.jobTitle,
                        };
                    }
                    else if (contact.type === "user-user" && contact.userConnectionId) {
                        const connection = contact.userConnectionId;
                        const otherUser = connection.requester._id.toString() === userId
                            ? connection.recipient
                            : connection.requester;
                        targetId = otherUser._id.toString();
                        targetName = otherUser.name || "Unknown";
                        targetProfilePic = otherUser.profilePic || "";
                        targetJobTitle = otherUser.jobTitle;
                        userConnectionId = connection._id.toString();
                        connectionDetails = {
                            requestAcceptedAt: connection.requestAcceptedAt,
                            requesterName: connection.requester.name || "Unknown",
                            requesterProfilePic: connection.requester.profilePic || "",
                            requesterJobTitle: connection.requester.jobTitle,
                            recipientName: connection.recipient.name || "Unknown",
                            recipientProfilePic: connection.recipient.profilePic || "",
                            recipientJobTitle: connection.recipient.jobTitle,
                        };
                    }
                    else if (contact.type === "group" && contact.groupId) {
                        const group = contact.groupId;
                        targetId = group._id.toString();
                        targetName = group.name || "Unknown";
                        targetProfilePic = group.profilePic || "";
                        groupId = group._id.toString();
                        groupDetails = {
                            groupName: group.name || "Unknown Group",
                            startDate: group.startDate,
                            adminName: group.adminId?.name || "Unknown",
                            adminProfilePic: group.adminId?.profilePic || "",
                            bio: group.bio || "No Bio",
                            price: group.price,
                            maxMembers: group.maxMembers,
                            availableSlots: group.availableSlots,
                            members: group.members.map((member) => ({
                                userId: member.userId._id.toString(),
                                name: member.userId.name || "Unknown",
                                profilePic: member.userId.profilePic || "",
                                joinedAt: member.joinedAt,
                            })),
                        };
                    }
                    return {
                        _id: contact._id.toString(),
                        contactId: contact.contactId,
                        userId: contactUserId,
                        targetId,
                        type: contact.type,
                        targetName,
                        targetProfilePic,
                        targetJobTitle,
                        collaborationId,
                        collaborationDetails,
                        userConnectionId,
                        connectionDetails,
                        groupId,
                        groupDetails,
                    };
                });
                const validContacts = formattedContacts.filter((contact) => contact.userId === userId &&
                    contact.userId !== contact.targetId &&
                    contact.targetId !== "");
                logger_1.default.info(`Retrieved ${validContacts.length} valid contacts for user: ${userId}`);
                return validContacts;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching contacts for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch user contacts", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._contactRepository = contactRepository;
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IContactRepository')),
    __metadata("design:paramtypes", [Object])
], ContactService);
//# sourceMappingURL=contact-service.js.map