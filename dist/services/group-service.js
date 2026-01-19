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
exports.GroupService = void 0;
const inversify_1 = require("inversify");
const email_1 = require("../core/utils/email");
const stripe_1 = __importDefault(require("../core/utils/stripe"));
const uuid_1 = require("uuid");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const mongoose_1 = require("mongoose");
const status_code_enums_1 = require("../enums/status-code-enums");
const group_mapper_1 = require("../Utils/mappers/group-mapper");
const group_request_mapper_1 = require("../Utils/mappers/group-request-mapper");
let GroupService = class GroupService {
    constructor(groupRepository, contactRepository, userRepository) {
        this.createGroup = async (groupData) => {
            try {
                logger_1.default.debug(`Creating group: ${groupData.name}`);
                if (!groupData.name ||
                    !groupData.bio ||
                    !groupData.adminId ||
                    !groupData.startDate) {
                    logger_1.default.error("Missing required fields: name, bio, adminId, or startDate");
                    throw new error_handler_1.ServiceError("Group name, bio, adminId, and startDate are required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (!mongoose_1.Types.ObjectId.isValid(groupData.adminId)) {
                    logger_1.default.error("Invalid adminId");
                    throw new error_handler_1.ServiceError("Admin ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (!groupData.availableSlots || groupData.availableSlots.length === 0) {
                    logger_1.default.error("No available slots provided");
                    throw new error_handler_1.ServiceError("At least one available slot is required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (groupData.maxMembers > 4) {
                    logger_1.default.error("Maximum members exceeded");
                    throw new error_handler_1.ServiceError("Maximum members cannot exceed 4", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (groupData.members &&
                    groupData.members.some((id) => !mongoose_1.Types.ObjectId.isValid(id))) {
                    logger_1.default.error("Invalid member ID in members array");
                    throw new error_handler_1.ServiceError("All member IDs must be valid ObjectIds", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const newGroup = await this._groupRepository.createGroup({
                    ...groupData,
                    members: groupData.members || [],
                });
                logger_1.default.info(`Created group: ${newGroup._id} (${newGroup.name})`);
                await this._contactRepository.createContact({
                    userId: groupData.adminId,
                    groupId: newGroup._id.toString(),
                    type: "group",
                });
                logger_1.default.info(`Contact created for admin ${groupData.adminId} in group ${newGroup._id}`);
                return (0, group_mapper_1.toGroupDTO)(newGroup);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating group ${groupData.name}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to create group", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getGroupDetails = async (adminId) => {
            try {
                logger_1.default.debug(`Fetching groups for admin: ${adminId}`);
                if (!mongoose_1.Types.ObjectId.isValid(adminId)) {
                    logger_1.default.error("Invalid admin ID");
                    throw new error_handler_1.ServiceError("Admin ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const groups = await this._groupRepository.getGroupsByAdminId(adminId);
                logger_1.default.info(`Fetched ${groups.length} groups for admin: ${adminId}`);
                return (0, group_mapper_1.toGroupDTOs)(groups);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching groups for admin ${adminId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch groups for admin", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getGroupById = async (groupId) => {
            try {
                logger_1.default.debug(`Fetching group by ID: ${groupId}`);
                if (!mongoose_1.Types.ObjectId.isValid(groupId)) {
                    logger_1.default.error("Invalid group ID");
                    throw new error_handler_1.ServiceError("Group ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const group = await this._groupRepository.getGroupById(groupId);
                if (!group) {
                    logger_1.default.warn(`Group not found: ${groupId}`);
                    throw new error_handler_1.ServiceError("Group not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Fetched group: ${groupId} (${group.name})`);
                return (0, group_mapper_1.toGroupDTO)(group);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching group ${groupId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch group", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllGroups = async (query = {}) => {
            try {
                logger_1.default.debug(`Fetching all groups with query: ${JSON.stringify(query)}`);
                const result = await this._groupRepository.getAllGroups(query);
                // logger.debug(`Raw group data from repository: ${JSON.stringify(result.groups, null, 2)}`);
                logger_1.default.info(`Fetched ${result.groups} groups, total: ${result.total}`);
                return {
                    groups: (0, group_mapper_1.toGroupDTOs)(result.groups),
                    total: result.total
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching all groups: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch all groups", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.requestToJoinGroup = async (groupId, userId) => {
            try {
                logger_1.default.debug(`Creating group request for group: ${groupId}, user: ${userId}`);
                if (!mongoose_1.Types.ObjectId.isValid(groupId) || !mongoose_1.Types.ObjectId.isValid(userId)) {
                    logger_1.default.error("Invalid group ID or user ID");
                    throw new error_handler_1.ServiceError("Group ID and User ID must be valid ObjectIds", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const group = await this._groupRepository.getGroupById(groupId);
                if (!group) {
                    logger_1.default.error(`Group not found: ${groupId}`);
                    throw new error_handler_1.ServiceError("Group not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const request = await this._groupRepository.createGroupRequest({
                    groupId,
                    userId,
                });
                logger_1.default.info(`Group request created: ${request._id} for group ${groupId}, user ${userId}`);
                return (0, group_request_mapper_1.toGroupRequestDTO)(request);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating group request for group ${groupId}, user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to create group request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getGroupRequestsByGroupId = async (groupId) => {
            try {
                logger_1.default.debug(`Fetching group requests for group: ${groupId}`);
                if (!mongoose_1.Types.ObjectId.isValid(groupId)) {
                    logger_1.default.error("Invalid group ID");
                    throw new error_handler_1.ServiceError("Group ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const requests = await this._groupRepository.getGroupRequestsByGroupId(groupId);
                logger_1.default.info(`Fetched ${requests.length} group requests for group: ${groupId}`);
                return (0, group_request_mapper_1.toGroupRequestDTOs)(requests);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching group requests for group ${groupId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch group requests", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getGroupRequestsByAdminId = async (adminId) => {
            try {
                logger_1.default.debug(`Fetching group requests for admin: ${adminId}`);
                if (!mongoose_1.Types.ObjectId.isValid(adminId)) {
                    logger_1.default.error("Invalid admin ID");
                    throw new error_handler_1.ServiceError("Admin ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const requests = await this._groupRepository.getGroupRequestsByAdminId(adminId);
                logger_1.default.info(`Fetched ${requests.length} group requests for admin: ${adminId}`);
                return (0, group_request_mapper_1.toGroupRequestDTOs)(requests);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching group requests for admin ${adminId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch group requests for admin", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getGroupRequestsByUserId = async (userId) => {
            try {
                logger_1.default.debug(`Fetching group requests for user: ${userId}`);
                if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                    logger_1.default.error("Invalid user ID");
                    throw new error_handler_1.ServiceError("User ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const requests = await this._groupRepository.getGroupRequestsByUserId(userId);
                logger_1.default.info(`Fetched ${requests.length} group requests for user: ${userId}`);
                return (0, group_request_mapper_1.toGroupRequestDTOs)(requests);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching group requests for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch group requests for user", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getGroupRequestById = async (requestId) => {
            try {
                logger_1.default.debug(`Fetching group request by ID: ${requestId}`);
                if (!mongoose_1.Types.ObjectId.isValid(requestId)) {
                    logger_1.default.error("Invalid request ID");
                    throw new error_handler_1.ServiceError("Request ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const request = await this._groupRepository.findGroupRequestById(requestId);
                if (!request) {
                    logger_1.default.warn(`Group request not found: ${requestId}`);
                    throw new error_handler_1.ServiceError("Group request not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Fetched group request: ${requestId}`);
                return (0, group_request_mapper_1.toGroupRequestDTO)(request);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching group request ${requestId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch group request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        //Accept the Request or Reject the request
        this.modifyGroupRequestStatus = async (requestId, status) => {
            try {
                logger_1.default.debug(`Modifying group request status: ${requestId} to ${status}`);
                if (!mongoose_1.Types.ObjectId.isValid(requestId)) {
                    logger_1.default.error("Invalid request ID");
                    throw new error_handler_1.ServiceError("Request ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const validStatuses = ["Accepted", "Rejected"];
                if (!validStatuses.includes(status)) {
                    logger_1.default.error(`Invalid status: ${status}`);
                    throw new error_handler_1.ServiceError(`Status must be one of: ${validStatuses.join(", ")}`, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const request = await this._groupRepository.findGroupRequestById(requestId);
                if (!request) {
                    logger_1.default.error(`Group request not found: ${requestId}`);
                    throw new error_handler_1.ServiceError("Group request not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                if (!request.groupId?._id) {
                    logger_1.default.error(`Group ID not found in request: ${requestId}`);
                    throw new error_handler_1.ServiceError("Group ID not found in request", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (!request.userId?._id) {
                    logger_1.default.error(`User ID not found in request: ${requestId}`);
                    throw new error_handler_1.ServiceError("User ID not found in request", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const group = await this._groupRepository.getGroupById(request.groupId._id.toString());
                if (!group) {
                    logger_1.default.error(`Group not found: ${request.groupId._id}`);
                    throw new error_handler_1.ServiceError("Group not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                if (status === "Accepted") {
                    if (group.isFull || group.members.length >= group.maxMembers) {
                        logger_1.default.error(`Cannot accept request for group ${group._id}: Group is full`);
                        throw new error_handler_1.ServiceError("Cannot accept request. Group is full (maximum 4 members)", status_code_enums_1.StatusCodes.BAD_REQUEST);
                    }
                    await this._groupRepository.updateGroupRequestStatus(requestId, "Accepted");
                    if (group.price > 0) {
                        logger_1.default.info(`Group ${group._id} requires payment: ${group.price}`);
                        return {
                            message: "Request accepted. Awaiting payment",
                            requiresPayment: true,
                            groupPrice: group.price,
                            groupId: group._id.toString(),
                        };
                    }
                    else {
                        await this._groupRepository.addMemberToGroup(group._id.toString(), request.userId._id.toString());
                        await this._contactRepository.createContact({
                            userId: request.userId._id.toString(),
                            groupId: group._id.toString(),
                            type: "group",
                        });
                        await this._groupRepository.deleteGroupRequest(requestId);
                        const updatedGroup = await this._groupRepository.getGroupById(group._id.toString());
                        if (!updatedGroup) {
                            logger_1.default.error(`Failed to fetch updated group ${group._id} after adding member`);
                            throw new error_handler_1.ServiceError("Failed to fetch updated group", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                        }
                        const userInGroup = updatedGroup.members.some((m) => m.userId instanceof mongoose_1.Types.ObjectId
                            ? m.userId.toString() === request.userId._id.toString()
                            : m.userId?._id?.toString() ===
                                request.userId._id.toString());
                        if (!userInGroup) {
                            logger_1.default.error(`User ${request.userId._id} not found in group ${group._id} members after addition`);
                            throw new error_handler_1.ServiceError("Failed to add member to group", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                        }
                        logger_1.default.info(`User ${request.userId._id} added to group ${group._id}`);
                        return { message: "User added to group successfully" };
                    }
                }
                else {
                    await this._groupRepository.updateGroupRequestStatus(requestId, "Rejected");
                    logger_1.default.info(`Group request ${requestId} rejected`);
                    return { message: "Request rejected successfully" };
                }
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error modifying group request ${requestId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to modify group request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.processGroupPayment = async (paymentMethodId, amount, requestId, email, groupRequestData, returnUrl) => {
            try {
                logger_1.default.debug(`Processing payment for group request: ${requestId}`);
                if (!mongoose_1.Types.ObjectId.isValid(requestId) ||
                    !mongoose_1.Types.ObjectId.isValid(groupRequestData.groupId) ||
                    !mongoose_1.Types.ObjectId.isValid(groupRequestData.userId)) {
                    logger_1.default.error("Invalid request ID, group ID, or user ID");
                    throw new error_handler_1.ServiceError("Request ID, Group ID, and User ID must be valid ObjectIds", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (amount <= 0) {
                    logger_1.default.error("Invalid payment amount");
                    throw new error_handler_1.ServiceError("Payment amount must be greater than 0", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const request = await this._groupRepository.findGroupRequestById(requestId);
                if (!request) {
                    logger_1.default.error(`Group request not found: ${requestId}`);
                    throw new error_handler_1.ServiceError("Group request not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const group = await this._groupRepository.getGroupById(groupRequestData.groupId);
                if (!group) {
                    logger_1.default.error(`Group not found: ${groupRequestData.groupId}`);
                    throw new error_handler_1.ServiceError("Group not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                if (group.isFull || group.members.length >= group.maxMembers) {
                    logger_1.default.error(`Cannot complete payment for group ${group._id}: Group is full`);
                    throw new error_handler_1.ServiceError("Cannot complete payment. Group is full (maximum 4 members)", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const paymentMethodIdString = typeof paymentMethodId === "string"
                    ? paymentMethodId
                    : paymentMethodId.id;
                if (!paymentMethodIdString) {
                    logger_1.default.error("Invalid paymentMethodId");
                    throw new error_handler_1.ServiceError("Invalid paymentMethodId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const idempotencyKey = (0, uuid_1.v4)();
                let customers = await stripe_1.default.customers.list({ email, limit: 1 });
                let customer = customers.data.length > 0 ? customers.data[0] : null;
                if (!customer) {
                    customer = await stripe_1.default.customers.create({
                        email,
                        payment_method: paymentMethodIdString,
                        invoice_settings: { default_payment_method: paymentMethodIdString },
                    });
                    logger_1.default.info(`Created new Stripe customer for email: ${email}`);
                }
                const paymentIntent = await stripe_1.default.paymentIntents.create({
                    amount,
                    currency: "inr",
                    customer: customer.id,
                    payment_method: paymentMethodIdString,
                    confirm: true,
                    description: `Payment for Group Request ID: ${requestId}`,
                    receipt_email: email,
                    metadata: {
                        requestId,
                        groupId: groupRequestData.groupId,
                        userId: groupRequestData.userId,
                    },
                    return_url: `${returnUrl}?payment_status=success&request_id=${requestId}`,
                }, { idempotencyKey });
                if (paymentIntent.status === "succeeded") {
                    await this._groupRepository.updateGroupPaymentStatus(requestId, amount / 100);
                    await this._groupRepository.addMemberToGroup(groupRequestData.groupId, groupRequestData.userId);
                    await this._contactRepository.createContact({
                        userId: groupRequestData.userId,
                        groupId: groupRequestData.groupId,
                        type: "group",
                    });
                    await this._groupRepository.deleteGroupRequest(requestId);
                    logger_1.default.info(`Payment processed and user ${groupRequestData.userId} added to group ${groupRequestData.groupId}`);
                }
                return { paymentIntent };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error processing payment for group request ${requestId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to process group payment", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.removeGroupMember = async (groupId, userId) => {
            try {
                logger_1.default.debug(`Removing user ${userId} from group ${groupId}`);
                if (!mongoose_1.Types.ObjectId.isValid(groupId) || !mongoose_1.Types.ObjectId.isValid(userId)) {
                    logger_1.default.error("Invalid group ID or user ID");
                    throw new error_handler_1.ServiceError("Group ID and User ID must be valid ObjectIds", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const group = await this._groupRepository.getGroupById(groupId);
                if (!group) {
                    logger_1.default.error(`Group not found: ${groupId}`);
                    throw new error_handler_1.ServiceError("Group not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const user = await this._userRepository.findById(userId);
                if (!user) {
                    logger_1.default.error(`User not found: ${userId}`);
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const userInGroup = group.members.some((m) => m.userId instanceof mongoose_1.Types.ObjectId
                    ? m.userId.toString() === userId
                    : m.userId?._id?.toString() === userId);
                if (!userInGroup) {
                    logger_1.default.error(`User ${userId} not found in group ${groupId}`);
                    throw new error_handler_1.ServiceError("User not found in group", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                await this._groupRepository.removeGroupMember(groupId, userId);
                await this._contactRepository.deleteContact(groupId, "group", userId);
                const updatedGroup = await this._groupRepository.getGroupById(groupId);
                if (!updatedGroup) {
                    logger_1.default.error(`Failed to fetch updated group ${groupId} after removing member`);
                    throw new error_handler_1.ServiceError("Failed to fetch updated group", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                const userStillInGroup = updatedGroup.members.some((m) => m.userId instanceof mongoose_1.Types.ObjectId
                    ? m.userId.toString() === userId
                    : m.userId?._id?.toString() === userId);
                if (userStillInGroup) {
                    logger_1.default.error(`Failed to remove user ${userId} from group ${groupId}`);
                    throw new error_handler_1.ServiceError("Failed to remove user from group", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                const subject = `You have been removed from the group "${group.name}"`;
                const text = `Hi ${user.name},\n\nWe wanted to inform you that you have been removed from the group "${group.name}" on ConnectSphere.\n\nIf you believe this was a mistake or have any questions, feel free to reach out to our support team.\n\nBest regards,\nConnectSphere Team`;
                await (0, email_1.sendEmail)(user.email, subject, text);
                logger_1.default.info(`Removal email sent to: ${user.email}`);
                logger_1.default.info(`User ${userId} removed from group ${groupId} and contact deleted`);
                return (0, group_mapper_1.toGroupDTO)(updatedGroup);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error removing user ${userId} from group ${groupId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to remove group member", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteGroup = async (groupId) => {
            try {
                logger_1.default.debug(`Deleting group: ${groupId}`);
                if (!mongoose_1.Types.ObjectId.isValid(groupId)) {
                    logger_1.default.error("Invalid group ID");
                    throw new error_handler_1.ServiceError("Group ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const group = await this._groupRepository.getGroupById(groupId);
                if (!group) {
                    logger_1.default.error(`Group not found: ${groupId}`);
                    throw new error_handler_1.ServiceError("Group not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                await this._groupRepository.deleteGroupRequestsByGroupId(groupId);
                await this._contactRepository.deleteContact(groupId, "group");
                const deletedGroup = await this._groupRepository.deleteGroupById(groupId);
                logger_1.default.info(`Group ${groupId} deleted and associated contacts and requests removed`);
                const deletedGroupDTO = (0, group_mapper_1.toGroupDTO)(deletedGroup);
                return deletedGroupDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting group ${groupId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to delete group", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateGroupImage = async (groupId, profilePic, coverPic) => {
            try {
                logger_1.default.debug(`Updating group image for group: ${groupId}`);
                if (!mongoose_1.Types.ObjectId.isValid(groupId)) {
                    logger_1.default.error("Invalid group ID");
                    throw new error_handler_1.ServiceError("Group ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const updateData = {};
                if (profilePic)
                    updateData.profilePic = profilePic;
                if (coverPic)
                    updateData.coverPic = coverPic;
                if (Object.keys(updateData).length === 0) {
                    logger_1.default.error("No image data provided");
                    throw new error_handler_1.ServiceError("No image data provided", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const updatedGroup = await this._groupRepository.updateGroupImage(groupId, updateData);
                if (!updatedGroup) {
                    logger_1.default.warn(`Group not found: ${groupId}`);
                    throw new error_handler_1.ServiceError("Group not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Group image updated for group: ${groupId}`);
                return (0, group_mapper_1.toGroupDTO)(updatedGroup);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating group image for group ${groupId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to update group image", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getGroupDetailsForMembers = async (userId) => {
            try {
                logger_1.default.debug(`Fetching group details for member: ${userId}`);
                if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                    logger_1.default.error("Invalid user ID");
                    throw new error_handler_1.ServiceError("User ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const groups = await this._groupRepository.getGroupDetailsByUserId(userId);
                logger_1.default.info(`Fetched ${groups.length} groups for member: ${userId}`);
                return (0, group_mapper_1.toGroupDTOs)(groups);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching group details for member ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch group details for member", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllGroupRequests = async (search = "", page = 1, limit = 10) => {
            try {
                logger_1.default.debug(`Service: fetching group requests (search="${search}")`);
                const result = await this._groupRepository.getAllGroupRequests(search, page, limit);
                const requests = (0, group_request_mapper_1.toGroupRequestDTOs)(result);
                const total = result.total || requests.length;
                logger_1.default.info(`Service: fetched ${requests.length} group requests`);
                return { requests, total };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Service error in getAllGroupRequests: ${err.message}`);
                throw new error_handler_1.ServiceError("Failed to fetch group requests", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._groupRepository = groupRepository;
        this._contactRepository = contactRepository;
        this._userRepository = userRepository;
    }
};
exports.GroupService = GroupService;
exports.GroupService = GroupService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IGroupRepository')),
    __param(1, (0, inversify_1.inject)('IContactRepository')),
    __param(2, (0, inversify_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], GroupService);
//# sourceMappingURL=group-service.js.map