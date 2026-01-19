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
exports.GroupController = void 0;
const inversify_1 = require("inversify");
const cloudinary_1 = require("../core/utils/cloudinary");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const status_code_enums_1 = require("../enums/status-code-enums");
const base_controller_1 = require("../core/controller/base-controller");
const messages_1 = require("../constants/messages");
const error_messages_1 = require("../constants/error-messages");
let GroupController = class GroupController extends base_controller_1.BaseController {
    constructor(groupService) {
        super();
        this.createGroup = async (req, res, next) => {
            try {
                logger_1.default.debug("Creating group");
                const groupData = req.body;
                const createdGroup = await this._groupService.createGroup(groupData);
                this.sendCreated(res, { group: createdGroup }, messages_1.GROUP_MESSAGES.GROUP_CREATED);
            }
            catch (error) {
                logger_1.default.error(`Error in createGroup: ${error.message}`);
                next(error);
            }
        };
        this.getGroupDetails = async (req, res, next) => {
            try {
                const { adminId } = req.params;
                logger_1.default.debug(`Fetching groups for admin: ${adminId}`);
                const groups = await this._groupService.getGroupDetails(adminId);
                logger_1.default.info("groups Fetched : ", groups);
                this.sendSuccess(res, { groups }, groups.length === 0 ? messages_1.GROUP_MESSAGES.NO_GROUPS_FOUND_FOR_ADMIN : messages_1.GROUP_MESSAGES.GROUPS_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error in getGroupDetails: ${error.message}`);
                next(error);
            }
        };
        this.getGroupById = async (req, res, next) => {
            try {
                const { groupId } = req.params;
                logger_1.default.debug(`Fetching group by ID: ${groupId}`);
                const group = await this._groupService.getGroupById(groupId);
                if (!group) {
                    this.sendSuccess(res, {}, messages_1.GROUP_MESSAGES.NO_GROUPS_FOUND);
                    return;
                }
                this.sendSuccess(res, { group }, messages_1.GROUP_MESSAGES.GROUP_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error in getGroupById: ${error.message}`);
                next(error);
            }
        };
        this.getAllGroups = async (req, res, next) => {
            try {
                const { search, page, limit, excludeAdminId } = req.query;
                const query = {};
                if (search)
                    query.search = search;
                if (page)
                    query.page = parseInt(page, 10);
                if (limit)
                    query.limit = parseInt(limit, 10);
                if (excludeAdminId)
                    query.excludeAdminId = excludeAdminId;
                logger_1.default.debug(`Fetching groups with query: ${JSON.stringify(query)}`);
                const result = await this._groupService.getAllGroups(query);
                if (result.groups.length === 0) {
                    this.sendSuccess(res, { groups: [], total: 0, page: query.page || 1, limit: query.limit || 10 }, messages_1.GROUP_MESSAGES.NO_GROUPS_FOUND);
                    return;
                }
                const data = !search && !page && !limit
                    ? result.groups
                    : {
                        groups: result.groups,
                        total: result.total,
                        page: query.page || 1,
                        limit: query.limit || 10,
                    };
                this.sendSuccess(res, data, messages_1.GROUP_MESSAGES.GROUPS_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error in getAllGroups: ${error.message}`);
                next(error);
            }
        };
        this.sendGroupRequest = async (req, res, next) => {
            try {
                const { groupId, userId } = req.body;
                logger_1.default.debug(`Sending group request for group: ${groupId}, user: ${userId}`);
                const request = await this._groupService.requestToJoinGroup(groupId, userId);
                this.sendCreated(res, { request }, messages_1.GROUP_MESSAGES.GROUP_REQUEST_SENT);
            }
            catch (error) {
                logger_1.default.error(`Error in sendGroupRequest: ${error.message}`);
                next(error);
            }
        };
        this.getGroupRequestsByGroupId = async (req, res, next) => {
            try {
                const { groupId } = req.params;
                logger_1.default.debug(`Fetching group requests for group: ${groupId}`);
                const requests = await this._groupService.getGroupRequestsByGroupId(groupId);
                this.sendSuccess(res, { requests }, requests.length === 0 ? messages_1.GROUP_MESSAGES.NO_GROUP_REQUESTS_FOUND_FOR_GROUP : messages_1.GROUP_MESSAGES.GROUP_REQUESTS_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error in getGroupRequestsByGroupId: ${error.message}`);
                next(error);
            }
        };
        this.getGroupRequestsByAdminId = async (req, res, next) => {
            try {
                const { adminId } = req.params;
                logger_1.default.debug(`Fetching group requests for admin: ${adminId}`);
                const requests = await this._groupService.getGroupRequestsByAdminId(adminId);
                this.sendSuccess(res, { requests }, requests.length === 0 ? messages_1.GROUP_MESSAGES.NO_GROUP_REQUESTS_FOUND_FOR_ADMIN : messages_1.GROUP_MESSAGES.GROUP_REQUESTS_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error in getGroupRequestsByAdminId: ${error.message}`);
                next(error);
            }
        };
        this.getGroupRequestsByUserId = async (req, res, next) => {
            try {
                const { userId } = req.params;
                logger_1.default.debug(`Fetching group requests for user: ${userId}`);
                const requests = await this._groupService.getGroupRequestsByUserId(userId);
                this.sendSuccess(res, { requests }, requests.length === 0 ? messages_1.GROUP_MESSAGES.NO_GROUP_REQUESTS_FOUND_FOR_USER : messages_1.GROUP_MESSAGES.GROUP_REQUESTS_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error in getGroupRequestsByUserId: ${error.message}`);
                next(error);
            }
        };
        this.updateGroupRequest = async (req, res, next) => {
            try {
                const { requestId, status } = req.body;
                logger_1.default.debug(`Updating group request: ${requestId} to ${status} :- Controller`);
                const result = await this._groupService.modifyGroupRequestStatus(requestId, status);
                this.sendSuccess(res, { result }, messages_1.GROUP_MESSAGES.GROUP_REQUEST_UPDATED);
            }
            catch (error) {
                logger_1.default.error(`Error in updateGroupRequest: ${error.message}`);
                next(error);
            }
        };
        this.makeStripePayment = async (req, res, next) => {
            try {
                const { paymentMethodId, amount, requestId, email, groupRequestData, returnUrl } = req.body;
                if (!paymentMethodId || !amount || !requestId || !email || !groupRequestData || !returnUrl) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.MISSING_PAYMENT_INFO, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const { paymentIntent } = await this._groupService.processGroupPayment(paymentMethodId, amount, requestId, email, groupRequestData, returnUrl);
                const message = paymentIntent.status === "requires_action"
                    ? messages_1.GROUP_MESSAGES.PAYMENT_REQUIRES_ACTION
                    : paymentIntent.status === "succeeded"
                        ? messages_1.GROUP_MESSAGES.PAYMENT_PROCESSED_SUCCESS
                        : messages_1.GROUP_MESSAGES.PAYMENT_PROCESSED_PENDING;
                this.sendSuccess(res, { paymentIntent }, message);
            }
            catch (error) {
                logger_1.default.error(`Error in makeStripePayment: ${error.message}`);
                next(error);
            }
        };
        this.removeGroupMember = async (req, res, next) => {
            try {
                const { groupId, userId } = req.body;
                logger_1.default.debug(`Removing user ${userId} from group ${groupId}`);
                const response = await this._groupService.removeGroupMember(groupId, userId);
                this.sendSuccess(res, { response }, messages_1.GROUP_MESSAGES.MEMBER_REMOVED);
            }
            catch (error) {
                logger_1.default.error(`Error in removeGroupMember: ${error.message}`);
                next(error);
            }
        };
        this.deleteGroup = async (req, res, next) => {
            try {
                const { groupId } = req.params;
                logger_1.default.debug(`Deleting group: ${groupId}`);
                const response = await this._groupService.deleteGroup(groupId);
                this.sendSuccess(res, { response }, messages_1.GROUP_MESSAGES.GROUP_DELETED);
            }
            catch (error) {
                logger_1.default.error(`Error in deleteGroup: ${error.message}`);
                next(error);
            }
        };
        this.updateGroupImage = async (req, res, next) => {
            try {
                const { groupId } = req.params;
                logger_1.default.debug(`Updating group image for group: ${groupId}`);
                const profilePic = req.files?.["profilePic"]?.[0];
                const coverPic = req.files?.["coverPic"]?.[0];
                if (!profilePic && !coverPic) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.INVALID_FILE_UPLOAD, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                let profilePicUrl;
                let coverPicUrl;
                if (profilePic) {
                    const { url } = await (0, cloudinary_1.uploadMedia)(profilePic.path, "group_profile_pictures", profilePic.size);
                    profilePicUrl = url;
                }
                if (coverPic) {
                    const { url } = await (0, cloudinary_1.uploadMedia)(coverPic.path, "group_cover_pictures", coverPic.size);
                    coverPicUrl = url;
                }
                const updatedGroup = await this._groupService.updateGroupImage(groupId, profilePicUrl, coverPicUrl);
                if (!updatedGroup) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.FAILED_TO_UPDATE_GROUP_IMAGE, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                this.sendSuccess(res, { updatedGroup }, messages_1.GROUP_MESSAGES.GROUP_IMAGE_UPDATED);
            }
            catch (error) {
                logger_1.default.error(`Error in updateGroupImage: ${error.message}`);
                next(error);
            }
        };
        this.getGroupDetailsForMembers = async (req, res, next) => {
            try {
                const { userid } = req.params;
                logger_1.default.debug(`Fetching group details for member: ${userid}`);
                const groups = await this._groupService.getGroupDetailsForMembers(userid);
                this.sendSuccess(res, { groups: groups || [] }, groups.length === 0 ? messages_1.GROUP_MESSAGES.NO_GROUPS_FOUND_FOR_USER : messages_1.GROUP_MESSAGES.GROUPS_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error in getGroupDetailsForMembers: ${error.message}`);
                next(error);
            }
        };
        this.getAllGroupRequests = async (req, res, next) => {
            try {
                const search = req.query.search || "";
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                logger_1.default.debug(`Controller: fetching group requests (page=${page}, search="${search}")`);
                const { requests, total } = await this._groupService.getAllGroupRequests(search, page, limit);
                this.sendSuccess(res, { requests, total, page, limit }, requests.length === 0
                    ? messages_1.GROUP_MESSAGES.NO_GROUP_REQUESTS_FOUND
                    : messages_1.GROUP_MESSAGES.GROUP_REQUESTS_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error in getAllGroupRequests: ${error.message}`);
                next(error);
            }
        };
        this.getGroupRequestById = async (req, res, next) => {
            try {
                const { requestId } = req.params;
                logger_1.default.debug(`Fetching group request by ID: ${requestId}`);
                const request = await this._groupService.getGroupRequestById(requestId);
                if (!request) {
                    this.sendSuccess(res, {}, messages_1.GROUP_MESSAGES.NO_GROUP_REQUESTS_FOUND);
                    return;
                }
                this.sendSuccess(res, { request }, messages_1.GROUP_MESSAGES.GROUP_REQUEST_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error in getGroupRequestById: ${error.message}`);
                next(error);
            }
        };
        this._groupService = groupService;
    }
};
exports.GroupController = GroupController;
exports.GroupController = GroupController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IGroupService')),
    __metadata("design:paramtypes", [Object])
], GroupController);
//# sourceMappingURL=group-controller.js.map