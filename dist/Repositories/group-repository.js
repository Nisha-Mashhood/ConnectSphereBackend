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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupRepository = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const group_model_1 = __importDefault(require("../Models/group-model"));
const group_request_model_1 = __importDefault(require("../Models/group-request-model"));
const status_code_enums_1 = require("../enums/status-code-enums");
let GroupRepository = class GroupRepository extends base_repositry_1.BaseRepository {
    constructor() {
        super(group_model_1.default);
        this.toObjectId = (id) => {
            if (!id) {
                logger_1.default.warn('Missing ID when converting to ObjectId');
                throw new error_handler_1.RepositoryError('Invalid ID: ID is required', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            const idStr = typeof id === 'string' ? id : id.toString();
            if (!mongoose_1.Types.ObjectId.isValid(idStr)) {
                logger_1.default.warn(`Invalid ObjectId format: ${idStr}`);
                throw new error_handler_1.RepositoryError('Invalid ID: must be a 24 character hex string', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            return new mongoose_1.Types.ObjectId(idStr);
        };
        this.createGroup = async (groupData) => {
            try {
                logger_1.default.debug(`Creating group with name: ${groupData.name}`);
                const newGroup = await this.create({
                    ...groupData,
                    adminId: this.toObjectId(groupData.adminId),
                    createdAt: groupData.createdAt || new Date(),
                    isFull: false,
                    startDate: groupData.startDate ? new Date(groupData.startDate) : undefined,
                    members: groupData.members
                        ? groupData.members.map((userId) => ({
                            userId: this.toObjectId(userId),
                            joinedAt: new Date(),
                        }))
                        : [],
                });
                logger_1.default.info(`Created group: ${newGroup._id}`);
                return newGroup;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating group with name ${groupData.name}`, err);
                throw new error_handler_1.RepositoryError('Error creating group', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getGroupsByAdminId = async (adminId) => {
            try {
                logger_1.default.debug(`Fetching groups for admin: ${adminId}`);
                const groups = await this.model
                    .find({ adminId: this.toObjectId(adminId) })
                    .populate('members.userId', '_id name email jobTitle profilePic')
                    .populate('adminId', '_id name email jobTitle profilePic')
                    .exec();
                logger_1.default.info(`Fetched ${groups.length} groups for adminId: ${adminId}`);
                return groups;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching groups for adminId ${adminId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching groups by admin ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getGroupById = async (groupId) => {
            try {
                logger_1.default.debug(`Fetching group by ID: ${groupId}`);
                const group = await this.model
                    .findById(this.toObjectId(groupId))
                    .populate('members.userId')
                    .populate('adminId')
                    .exec();
                logger_1.default.info(`Group ${group ? 'found' : 'not found'}: ${groupId}`);
                return group;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching group by ID ${groupId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching group by ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllGroups = async (query = {}) => {
            try {
                logger_1.default.debug(`Fetching all groups with query: ${JSON.stringify(query)}`);
                const { search, page, limit, excludeAdminId } = query;
                if (!search && !page && !limit) {
                    const groups = await this.model
                        .find()
                        .populate('members.userId', '_id name email jobTitle profilePic')
                        .populate('adminId', '_id name email jobTitle profilePic')
                        .exec();
                    logger_1.default.info(`Fetched ${groups.length} groups`);
                    return { groups, total: groups.length };
                }
                const matchStage = {};
                if (search) {
                    matchStage.name = { $regex: search, $options: 'i' };
                }
                if (excludeAdminId) {
                    matchStage.adminId = { $ne: this.toObjectId(excludeAdminId) };
                }
                const pipeline = [
                    { $match: matchStage },
                    { $unwind: { path: '$members', preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'members.userId',
                            foreignField: '_id',
                            as: 'members.userId',
                        },
                    },
                    {
                        $unwind: {
                            path: '$members.userId',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $group: {
                            _id: '$_id',
                            groupId: { $first: '$groupId' },
                            name: { $first: '$name' },
                            bio: { $first: '$bio' },
                            price: { $first: '$price' },
                            maxMembers: { $first: '$maxMembers' },
                            isFull: { $first: '$isFull' },
                            availableSlots: { $first: '$availableSlots' },
                            profilePic: { $first: '$profilePic' },
                            coverPic: { $first: '$coverPic' },
                            startDate: { $first: '$startDate' },
                            createdAt: { $first: '$createdAt' },
                            updatedAt: { $first: '$updatedAt' },
                            adminId: { $first: '$adminId' },
                            members: {
                                $push: {
                                    $cond: [
                                        { $eq: ['$members', {}] },
                                        null,
                                        {
                                            userId: '$members.userId',
                                            joinedAt: '$members.joinedAt',
                                            _id: '$members._id',
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    {
                        $addFields: {
                            members: {
                                $filter: {
                                    input: '$members',
                                    as: 'member',
                                    cond: { $ne: ['$$member', null] },
                                },
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'adminId',
                            foreignField: '_id',
                            as: 'adminId',
                        },
                    },
                    {
                        $unwind: {
                            path: '$adminId',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $facet: {
                            groups: [
                                { $skip: ((page || 1) - 1) * (limit || 10) },
                                { $limit: limit || 10 },
                            ],
                            total: [{ $count: 'count' }],
                        },
                    },
                ];
                const result = await this.model.aggregate(pipeline).exec();
                const groups = result[0]?.groups || [];
                const total = result[0]?.total[0]?.count || 0;
                logger_1.default.info(`Fetched ${groups.length} groups, total: ${total}`);
                return { groups, total };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching all groups`, err);
                throw new error_handler_1.RepositoryError('Error fetching all groups', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.createGroupRequest = async (data) => {
            try {
                logger_1.default.debug(`Creating group request for group: ${data.groupId}, user: ${data.userId}`);
                const request = await this._groupRequestModel.create({
                    groupId: this.toObjectId(data.groupId),
                    userId: this.toObjectId(data.userId),
                    status: 'Pending',
                    paymentStatus: 'Pending',
                });
                logger_1.default.info(`Group request created: ${request._id}`);
                return request;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating group request for group ${data.groupId}`, err);
                throw new error_handler_1.RepositoryError('Error creating group request', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getGroupRequestsByGroupId = async (groupId) => {
            try {
                logger_1.default.debug(`Fetching group requests for group: ${groupId}`);
                const requests = await this._groupRequestModel
                    .find({ groupId: this.toObjectId(groupId) })
                    .populate({
                    path: 'groupId',
                    populate: {
                        path: 'members.userId',
                        model: 'User',
                        select: '_id name email jobTitle profilePic',
                    },
                })
                    .populate('userId', '_id name email jobTitle profilePic')
                    .exec();
                logger_1.default.info(`Fetched ${requests.length} group requests for groupId: ${groupId}`);
                return requests;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching group requests for groupId ${groupId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching group requests by group ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getGroupRequestsByAdminId = async (adminId) => {
            try {
                logger_1.default.debug(`Fetching group requests for admin: ${adminId}`);
                const requests = await this._groupRequestModel
                    .find()
                    .populate({
                    path: 'groupId',
                    match: { adminId: this.toObjectId(adminId) },
                    populate: {
                        path: 'members.userId',
                        model: 'User',
                        select: '_id name email jobTitle profilePic',
                    },
                })
                    .populate('userId', '_id name email jobTitle profilePic')
                    .exec()
                    .then((requests) => requests.filter((req) => req.groupId));
                logger_1.default.info(`Fetched ${requests.length} group requests for adminId: ${adminId}`);
                return requests;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching group requests for adminId ${adminId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching group requests by admin ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getGroupRequestsByUserId = async (userId) => {
            try {
                logger_1.default.debug(`Fetching group requests for user: ${userId}`);
                const requests = await this._groupRequestModel
                    .find({ userId: this.toObjectId(userId) })
                    .populate({
                    path: 'groupId',
                    populate: {
                        path: 'members.userId',
                        model: 'User',
                        select: '_id name email jobTitle profilePic',
                    },
                })
                    .populate('userId', '_id name email jobTitle profilePic')
                    .exec();
                logger_1.default.info(`Fetched ${requests.length} group requests for userId: ${userId}`);
                return requests;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching group requests for userId ${userId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching group requests by user ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findGroupRequestById = async (requestId) => {
            try {
                logger_1.default.debug(`Fetching group request by ID: ${requestId}`);
                const request = await this._groupRequestModel
                    .findById(this.toObjectId(requestId))
                    .populate({
                    path: 'groupId',
                    populate: [
                        {
                            path: 'adminId',
                            model: 'User',
                            select: '_id name email jobTitle profilePic',
                        },
                        {
                            path: 'members.userId',
                            model: 'User',
                            select: '_id name email jobTitle profilePic',
                        },
                    ],
                })
                    .populate('userId', '_id name email jobTitle profilePic')
                    .exec();
                logger_1.default.info(`Group request ${request ? 'found' : 'not found'}: ${requestId}`);
                return request;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching group request by ID ${requestId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching group request by ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateGroupRequestStatus = async (requestId, status) => {
            try {
                logger_1.default.debug(`Updating group request status for ID: ${requestId} to ${status}`);
                const request = await this._groupRequestModel
                    .findByIdAndUpdate(this.toObjectId(requestId), { status }, { new: true })
                    .exec();
                if (!request) {
                    logger_1.default.warn(`Group request not found: ${requestId}`);
                    throw new error_handler_1.RepositoryError(`Group request not found with ID: ${requestId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Group request status updated: ${requestId} to ${status}`);
                return request;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating group request status for ID ${requestId}`, err);
                throw new error_handler_1.RepositoryError('Error updating group request status', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateGroupPaymentStatus = async (requestId, amountPaid) => {
            try {
                logger_1.default.debug(`Updating group payment status for request: ${requestId}`);
                const request = await this._groupRequestModel
                    .findByIdAndUpdate(this.toObjectId(requestId), { paymentStatus: 'Completed', amountPaid }, { new: true })
                    .exec();
                if (!request) {
                    logger_1.default.warn(`Group request not found: ${requestId}`);
                    throw new error_handler_1.RepositoryError(`Group request not found with ID: ${requestId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Group payment status updated: ${requestId}`);
                return request;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating group payment status for request ${requestId}`, err);
                throw new error_handler_1.RepositoryError('Error updating group payment status', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.addMemberToGroup = async (groupId, userId) => {
            try {
                logger_1.default.debug(`Adding user ${userId} to group ${groupId}`);
                const group = await this.model.findById(this.toObjectId(groupId)).exec();
                if (!group) {
                    logger_1.default.warn(`Group not found: ${groupId}`);
                    throw new error_handler_1.RepositoryError(`Group not found with ID: ${groupId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const isUserAlreadyInGroup = group.members.some((member) => member.userId.toString() === userId);
                if (!isUserAlreadyInGroup) {
                    group.members.push({ userId: this.toObjectId(userId), joinedAt: new Date() });
                    group.isFull = group.members.length >= group.maxMembers;
                    const updatedGroup = await group.save();
                    logger_1.default.info(`User ${userId} added to group ${groupId}`);
                    return updatedGroup;
                }
                logger_1.default.info(`User ${userId} already in group ${groupId}`);
                return group;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error adding user ${userId} to group ${groupId}`, err);
                throw new error_handler_1.RepositoryError('Error adding member to group', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteGroupRequest = async (requestId) => {
            try {
                logger_1.default.debug(`Deleting group request: ${requestId}`);
                const result = await this._groupRequestModel.findByIdAndDelete(this.toObjectId(requestId)).exec();
                if (!result) {
                    logger_1.default.warn(`Group request not found: ${requestId}`);
                    throw new error_handler_1.RepositoryError(`Group request not found with ID: ${requestId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Group request deleted: ${requestId}`);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting group request ${requestId}`, err);
                throw new error_handler_1.RepositoryError('Error deleting group request', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.removeGroupMember = async (groupId, userId) => {
            try {
                logger_1.default.debug(`Removing user ${userId} from group ${groupId}`);
                const group = await this.model.findById(this.toObjectId(groupId)).exec();
                if (!group) {
                    logger_1.default.warn(`Group not found: ${groupId}`);
                    throw new error_handler_1.RepositoryError(`Group not found with ID: ${groupId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                if (userId === group.adminId.toString()) {
                    logger_1.default.warn(`Attempted to remove admin ${userId} from group ${groupId}`);
                    throw new error_handler_1.RepositoryError('Cannot remove admin from group members', status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                group.members = group.members.filter((member) => member.userId.toString() !== userId);
                group.isFull = group.members.length >= group.maxMembers;
                const updatedGroup = await group.save();
                logger_1.default.info(`User ${userId} removed from group ${groupId}`);
                return updatedGroup;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error removing user ${userId} from group ${groupId}`, err);
                throw new error_handler_1.RepositoryError('Error removing group member', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteGroupById = async (groupId) => {
            try {
                logger_1.default.debug(`Deleting group: ${groupId}`);
                const group = await this.findByIdAndDelete(groupId);
                if (!group) {
                    logger_1.default.warn(`Group not found: ${groupId}`);
                    throw new error_handler_1.RepositoryError(`Group not found with ID: ${groupId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Group deleted: ${groupId}`);
                return group;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting group ${groupId}`, err);
                throw new error_handler_1.RepositoryError('Error deleting group', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteGroupRequestsByGroupId = async (groupId) => {
            try {
                logger_1.default.debug(`Deleting group requests for group: ${groupId}`);
                const result = await this._groupRequestModel.deleteMany({ groupId: this.toObjectId(groupId) }).exec();
                logger_1.default.info(`Deleted ${result.deletedCount || 0} group requests for groupId: ${groupId}`);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting group requests for groupId ${groupId}`, err);
                throw new error_handler_1.RepositoryError('Error deleting group requests', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateGroupImage = async (groupId, updateData) => {
            try {
                logger_1.default.debug(`Updating group image for group: ${groupId}`);
                const group = await this.findByIdAndUpdate(groupId, updateData, { new: true });
                if (!group) {
                    logger_1.default.warn(`Group not found: ${groupId}`);
                    throw new error_handler_1.RepositoryError(`Group not found with ID: ${groupId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Group image updated for group: ${groupId}`);
                return group;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating group image for group ${groupId}`, err);
                throw new error_handler_1.RepositoryError('Error updating group image', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getGroupDetailsByUserId = async (userId) => {
            try {
                logger_1.default.debug(`Fetching group details for user: ${userId}`);
                const groups = await this.model
                    .find({ 'members.userId': this.toObjectId(userId) })
                    .populate('members.userId', '_id name email jobTitle profilePic')
                    .populate('adminId', '_id name email jobTitle profilePic')
                    .exec();
                logger_1.default.info(`Fetched ${groups.length} groups for userId: ${userId}`);
                return groups;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching group details for userId ${userId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching group details by user ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllGroupRequests = async (search = "", page = 1, limit = 10) => {
            try {
                const allRequests = await this._groupRequestModel
                    .find()
                    .populate({
                    path: "groupId",
                    model: "Group",
                    populate: {
                        path: "members.userId",
                        model: "User",
                        select: "_id name email jobTitle profilePic",
                    },
                })
                    .populate({
                    path: "userId",
                    model: "User",
                    select: "_id name email jobTitle profilePic",
                })
                    .sort({ createdAt: -1 })
                    .exec();
                let filteredRequests = allRequests;
                if (search.trim()) {
                    const regex = new RegExp(search, "i");
                    filteredRequests = allRequests.filter((req) => {
                        const groupName = req.groupId?.name || "";
                        const userName = req.userId?.name || "";
                        const userEmail = req.userId?.email || "";
                        return (regex.test(groupName) ||
                            regex.test(userName) ||
                            regex.test(userEmail));
                    });
                }
                const total = filteredRequests.length;
                const paginated = filteredRequests.slice((page - 1) * limit, page * limit);
                logger_1.default.info(`Fetched ${paginated.length} group requests (total=${total})`);
                return Object.assign(paginated, { total });
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error fetching group requests", err);
                throw new error_handler_1.RepositoryError("Error fetching group requests", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.isUserInGroup = async (groupId, userId) => {
            try {
                logger_1.default.debug(`Checking if user ${userId} is in group ${groupId}`);
                const group = await this.model
                    .findOne({ _id: this.toObjectId(groupId), 'members.userId': this.toObjectId(userId) })
                    .exec();
                const isInGroup = !!group;
                logger_1.default.info(`User ${userId} is ${isInGroup ? '' : 'not '}in group ${groupId}`);
                return isInGroup;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error checking group membership for user ${userId} in group ${groupId}`, err);
                throw new error_handler_1.RepositoryError('Error checking group membership', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getGroupMembers = async (groupId) => {
            try {
                logger_1.default.debug(`Fetching group members for group: ${groupId}`);
                const group = await this.model.findById(this.toObjectId(groupId))
                    .select("members")
                    .exec();
                if (!group) {
                    logger_1.default.warn(`Group not found: ${groupId}`);
                    throw new error_handler_1.RepositoryError(`Group not found with ID: ${groupId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const members = group.members.map((member) => {
                    const userId = typeof member.userId === "string"
                        ? member.userId
                        : member.userId instanceof mongoose_1.Types.ObjectId
                            ? member.userId
                            : member.userId._id; // if it's IUser, take its _id
                    return this.toObjectId(userId);
                });
                logger_1.default.info(`Fetched ${members.length} members for group: ${groupId}`);
                return members;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching group members for group ${groupId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching group members', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._groupRequestModel = group_request_model_1.default;
    }
};
exports.GroupRepository = GroupRepository;
exports.GroupRepository = GroupRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], GroupRepository);
//# sourceMappingURL=group-repository.js.map