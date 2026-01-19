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
exports.CollaborationRepository = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const collaboration_model_1 = __importDefault(require("../Models/collaboration-model"));
const mentor_requset_model_1 = __importDefault(require("../Models/mentor-requset-model"));
const mentor_model_1 = __importDefault(require("../Models/mentor-model"));
const status_code_enums_1 = require("../enums/status-code-enums");
let CollaborationRepository = class CollaborationRepository extends base_repositry_1.BaseRepository {
    constructor() {
        super(collaboration_model_1.default);
        this.toObjectId = (id) => {
            if (!id) {
                logger_1.default.warn("Missing ID when converting to ObjectId");
                throw new error_handler_1.RepositoryError("Invalid ID: ID is required", status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            let idStr;
            if (typeof id === "string") {
                idStr = id;
            }
            else if (id instanceof mongoose_1.Types.ObjectId) {
                idStr = id.toString();
            }
            else if (typeof id === "object" && "_id" in id) {
                idStr = id._id.toString();
            }
            else {
                logger_1.default.warn(`Invalid ID type: ${typeof id}`);
                throw new error_handler_1.RepositoryError("Invalid ID: must be a string, ObjectId, IMentor, or IUser", status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            if (!mongoose_1.Types.ObjectId.isValid(idStr)) {
                logger_1.default.warn(`Invalid ObjectId format: ${idStr}`);
                throw new error_handler_1.RepositoryError("Invalid ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            return new mongoose_1.Types.ObjectId(idStr);
        };
        this.createTemporaryRequest = async (data) => {
            try {
                logger_1.default.debug(`Creating temporary request for user: ${data.userId}`);
                const request = await this._mentorRequestModel.create({
                    ...data,
                    mentorId: data.mentorId ? this.toObjectId(data.mentorId) : undefined,
                    userId: data.userId ? this.toObjectId(data.userId) : undefined,
                    paymentStatus: "Pending",
                    isAccepted: "Pending",
                });
                logger_1.default.info(`Temporary request created: ${request._id}`);
                return request;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating temporary request`, err);
                throw new error_handler_1.RepositoryError("Error creating temporary request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getMentorRequestsByMentorId = async (mentorId) => {
            try {
                logger_1.default.debug(`Fetching mentor requests for mentor: ${mentorId}`);
                const requests = await this._mentorRequestModel
                    .find({ mentorId: this.toObjectId(mentorId), isAccepted: "Pending" })
                    .populate({
                    path: "mentorId",
                    populate: { path: "userId", select: "_id name email profilePic" },
                })
                    .populate("userId", "_id name email profilePic")
                    .lean()
                    .exec();
                logger_1.default.info(`Fetched ${requests.length} mentor requests for mentorId: ${mentorId}`);
                return requests;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching mentor requests for mentorId ${mentorId}`, err);
                throw new error_handler_1.RepositoryError("Error fetching mentor requests", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findMentorRequestById = async (id) => {
            try {
                logger_1.default.debug(`Finding mentor request by ID: ${id}`);
                const request = await this._mentorRequestModel.findById(this.toObjectId(id)).exec();
                logger_1.default.info(`Mentor request ${request ? "found" : "not found"}: ${id}`);
                return request;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error finding mentor request by ID ${id}`, err);
                throw new error_handler_1.RepositoryError("Error finding mentor request by ID", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateMentorRequestStatus = async (id, status = "Pending") => {
            try {
                logger_1.default.debug(`Updating mentor request status for ID: ${id} to ${status}`);
                const request = await this._mentorRequestModel
                    .findByIdAndUpdate(this.toObjectId(id), { isAccepted: status }, { new: true })
                    .exec();
                logger_1.default.info(`Mentor request status updated: ${id} to ${status}`);
                return request;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating mentor request status for ID ${id}`, err);
                throw new error_handler_1.RepositoryError("Error updating mentor request status", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getRequestByUserId = async (userId) => {
            try {
                logger_1.default.debug(`Fetching requests for user: ${userId}`);
                const requests = await this._mentorRequestModel
                    .find({ userId: this.toObjectId(userId) })
                    .populate({
                    path: "mentorId",
                    populate: { path: "userId", select: "_id name email profilePic" },
                })
                    .exec();
                logger_1.default.info(`Fetched ${requests.length} mentor requests for userId: ${userId}`);
                return requests;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching requests for userId ${userId}`, err);
                throw new error_handler_1.RepositoryError("Error fetching requests by user ID", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.createCollaboration = async (collaborationData, session) => {
            try {
                logger_1.default.debug(`Creating collaboration for user: ${collaborationData.userId}`);
                // const collaboration = await this.create({
                //   ...collaborationData,
                //   mentorId: collaborationData.mentorId ? this.toObjectId(collaborationData.mentorId) : undefined,
                //   userId: collaborationData.userId ? this.toObjectId(collaborationData.userId) : undefined,
                // });
                const dataToCreate = {
                    ...collaborationData,
                    mentorId: collaborationData.mentorId
                        ? this.toObjectId(collaborationData.mentorId)
                        : undefined,
                    userId: collaborationData.userId
                        ? this.toObjectId(collaborationData.userId)
                        : undefined,
                };
                let collaboration;
                if (session) {
                    const [created] = await this.model.create([dataToCreate], { session });
                    collaboration = created;
                }
                else {
                    collaboration = await this.create(dataToCreate);
                }
                logger_1.default.info(`Collaboration created: ${collaboration._id}`);
                return collaboration;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating collaboration`, err);
                throw new error_handler_1.RepositoryError("Error creating collaboration", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteMentorRequest = async (requestId, session) => {
            try {
                logger_1.default.debug(`Deleting mentor request: ${requestId}`);
                // const result = await this._mentorRequestModel.findByIdAndDelete(this.toObjectId(requestId)).exec();
                const query = this._mentorRequestModel.findByIdAndDelete(this.toObjectId(requestId));
                const result = session ? await query.session(session).exec() : await query.exec();
                if (!result) {
                    logger_1.default.warn(`Mentor request not found for deletion: ${requestId}`);
                    throw new error_handler_1.RepositoryError(`Mentor request not found with ID: ${requestId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Mentor request deleted: ${requestId}`);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting mentor request ${requestId}`, err);
                throw new error_handler_1.RepositoryError("Error deleting mentor request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findCollabById = async (collabId) => {
            try {
                logger_1.default.debug(`Finding collaboration by ID: ${collabId}`);
                const collab = await this.model
                    .findById(this.toObjectId(collabId))
                    .populate({
                    path: "mentorId",
                    model: "Mentor",
                    populate: { path: "userId", model: "User" },
                })
                    .populate({ path: "userId", model: "User" })
                    .exec();
                logger_1.default.info(`Collaboration ${collab ? "found" : "not found"}: ${collabId}`);
                return collab;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error finding collaboration by ID ${collabId}`, err);
                throw new error_handler_1.RepositoryError("Error finding collaboration by ID", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteCollabById = async (collabId) => {
            try {
                logger_1.default.debug(`Deleting collaboration: ${collabId}`);
                const collab = await this.findByIdAndDelete(collabId);
                if (!collab) {
                    logger_1.default.warn(`Collaboration not found for deletion: ${collabId}`);
                    throw new error_handler_1.RepositoryError(`Collaboration not found with ID: ${collabId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Collaboration deleted: ${collabId}`);
                return collab;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting collaboration ${collabId}`, err);
                throw new error_handler_1.RepositoryError("Error deleting collaboration", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.markCollabAsCancelled = async (collabId) => {
            try {
                logger_1.default.debug(`Marking collaboration as cancelled: ${collabId}`);
                const collab = await this.findByIdAndUpdate(collabId, { isCancelled: true }, { new: true });
                if (!collab) {
                    logger_1.default.warn(`Collaboration not found for cancellation: ${collabId}`);
                    throw new error_handler_1.RepositoryError(`Collaboration not found with ID: ${collabId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Collaboration marked as cancelled: ${collabId}`);
                return collab;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error marking collaboration as cancelled ${collabId}`, err);
                throw new error_handler_1.RepositoryError("Error marking collaboration as cancelled", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateCollabFeedback = async (collabId) => {
            try {
                logger_1.default.debug(`Updating collaboration feedback for ID: ${collabId}`);
                const collab = await this.findByIdAndUpdate(collabId, { feedbackGiven: true }, { new: true });
                if (!collab) {
                    logger_1.default.warn(`Collaboration not found for feedback update: ${collabId}`);
                    throw new error_handler_1.RepositoryError(`Collaboration not found with ID: ${collabId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Collaboration feedback updated: ${collabId}`);
                return collab;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating collaboration feedback ${collabId}`, err);
                throw new error_handler_1.RepositoryError("Error updating collaboration feedback", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getCollabDataForUser = async (userId) => {
            try {
                logger_1.default.debug(`Fetching collaboration data for user: ${userId}`);
                const collaborations = await this.model
                    .find({ userId: this.toObjectId(userId), isCancelled: false })
                    .populate({
                    path: "mentorId",
                    populate: { path: "userId" },
                })
                    .populate("userId")
                    .exec();
                logger_1.default.info(`Fetched ${collaborations.length} collaborations for userId: ${userId}`);
                return collaborations;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching collaboration data for userId ${userId}`, err);
                throw new error_handler_1.RepositoryError("Error fetching collaboration data for user", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getCollabDataForMentor = async (mentorId) => {
            try {
                logger_1.default.debug(`Fetching collaboration data for mentor: ${mentorId}`);
                const mentor = await mentor_model_1.default.findById(this.toObjectId(mentorId)).select("userId");
                if (!mentor) {
                    logger_1.default.warn(`Mentor not found: ${mentorId}`);
                    throw new error_handler_1.RepositoryError("Mentor not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const userId = this.toObjectId(mentor.userId.toString());
                const collaborations = await this.model
                    .find({
                    $or: [
                        { mentorId: this.toObjectId(mentorId), isCancelled: false },
                        { userId, isCancelled: false },
                    ],
                })
                    .populate({
                    path: "mentorId",
                    populate: { path: "userId" },
                })
                    .populate("userId")
                    .exec();
                logger_1.default.info(`Fetched ${collaborations.length} collaborations for mentorId: ${mentorId}`);
                return collaborations;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching collaboration data for mentorId ${mentorId}`, err);
                throw new error_handler_1.RepositoryError("Error fetching collaboration data for mentor", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findByIdAndUpdateWithPopulate = async (id, update, options = { new: true }) => {
            try {
                const updated = await this.model
                    .findByIdAndUpdate(this.toObjectId(id), update, options)
                    .populate({
                    path: "mentorId",
                    populate: { path: "userId" },
                })
                    .populate("userId")
                    .exec();
                return updated;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating and populating collaboration ${id}: ${err.message}`);
                throw new error_handler_1.RepositoryError("Error updating and populating collaboration", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findMentorRequest = async ({ page = 1, limit = 10, search = "", }) => {
            logger_1.default.debug(`MentorRequest page=${page}, limit=${limit}, search="${search}"`);
            try {
                const matchStage = search
                    ? {
                        $match: {
                            $or: [
                                { "userId.name": { $regex: search, $options: "i" } },
                                { "userId.email": { $regex: search, $options: "i" } },
                                { "mentorId.userId.name": { $regex: search, $options: "i" } },
                                { "mentorId.userId.email": { $regex: search, $options: "i" } },
                                { "mentorId.specialization": { $regex: search, $options: "i" } },
                            ],
                        },
                    }
                    : { $match: {} };
                const pipeline = [
                    {
                        $lookup: {
                            from: "mentors",
                            localField: "mentorId",
                            foreignField: "_id",
                            as: "mentorId",
                        },
                    },
                    { $unwind: { path: "$mentorId", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "mentorId.userId",
                            foreignField: "_id",
                            as: "mentorId.userId",
                        },
                    },
                    { $unwind: { path: "$mentorId.userId", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "userId",
                            foreignField: "_id",
                            as: "userId",
                        },
                    },
                    { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
                    matchStage,
                    { $sort: { createdAt: -1 } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                ];
                const data = await this._mentorRequestModel.aggregate(pipeline);
                const totalPipeline = [
                    ...pipeline.slice(0, -2),
                    { $count: "total" },
                ];
                const totalResult = await this._mentorRequestModel.aggregate(totalPipeline);
                const total = totalResult[0]?.total || 0;
                const pages = Math.ceil(total / limit) || 1;
                return { requests: data, total, page, pages };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`[findMentorRequest] FAILED → ${err.message}\n${err.stack}`);
                throw new error_handler_1.RepositoryError("Error fetching mentor requests", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findCollab = async ({ page = 1, limit = 10, search = "", }) => {
            logger_1.default.debug(`findCollab page=${page}, limit=${limit}, search="${search}"`);
            try {
                const matchStage = search
                    ? {
                        $match: {
                            $or: [
                                { "userId.name": { $regex: search, $options: "i" } },
                                { "userId.email": { $regex: search, $options: "i" } },
                                { "mentorId.userId.name": { $regex: search, $options: "i" } },
                                { "mentorId.userId.email": { $regex: search, $options: "i" } },
                                { "mentorId.specialization": { $regex: search, $options: "i" } },
                            ],
                        },
                    }
                    : { $match: {} };
                const pipeline = [
                    {
                        $lookup: {
                            from: "mentors",
                            localField: "mentorId",
                            foreignField: "_id",
                            as: "mentorId",
                        },
                    },
                    { $unwind: { path: "$mentorId", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "mentorId.userId",
                            foreignField: "_id",
                            as: "mentorId.userId",
                        },
                    },
                    { $unwind: { path: "$mentorId.userId", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "userId",
                            foreignField: "_id",
                            as: "userId",
                        },
                    },
                    { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
                    matchStage,
                    { $sort: { createdAt: -1 } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                ];
                const data = await this.model.aggregate(pipeline);
                const totalPipeline = [
                    ...pipeline.slice(0, -2),
                    { $count: "total" },
                ];
                const totalResult = await this.model.aggregate(totalPipeline);
                const total = totalResult[0]?.total || 0;
                const pages = Math.ceil(total / limit) || 1;
                return { collabs: data, total, page, pages };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`[findCollab] FAILED → ${err.message}\n${err.stack}`);
                throw new error_handler_1.RepositoryError("Error fetching collaborations", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.fetchMentorRequestDetails = async (requestId) => {
            try {
                logger_1.default.debug(`Fetching mentor request details for ID: ${requestId}`);
                const result = await this._mentorRequestModel
                    .findById(this.toObjectId(requestId))
                    .populate({
                    path: "mentorId",
                    model: "Mentor",
                    populate: { path: "userId", model: "User" },
                })
                    .populate({ path: "userId", model: "User" })
                    .exec();
                logger_1.default.info(`Mentor request details ${result ? "found" : "not found"}: ${requestId}`);
                return result;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching mentor request details ${requestId}`, err);
                throw new error_handler_1.RepositoryError("Error fetching mentor request details", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findCollabDetails = async (collabId) => {
            try {
                logger_1.default.debug(`Fetching collaboration details for ID: ${collabId}`);
                const collab = await this.findCollabById(collabId);
                logger_1.default.info(`Collaboration details ${collab ? "found" : "not found"}: ${collabId}`);
                return collab;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching collaboration details ${collabId}`, err);
                throw new error_handler_1.RepositoryError("Error fetching collaboration details", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateUnavailableDays = async (collabId, updateData) => {
            try {
                logger_1.default.debug(`Updating unavailable days for collaboration: ${collabId}`);
                const collab = await this.findByIdAndUpdate(collabId, {
                    $push: {
                        unavailableDays: {
                            datesAndReasons: updateData.datesAndReasons,
                            requestedBy: updateData.requestedBy,
                            requesterId: this.toObjectId(updateData.requesterId),
                            approvedById: this.toObjectId(updateData.approvedById),
                            isApproved: updateData.isApproved,
                        },
                    },
                }, { new: true });
                if (!collab) {
                    logger_1.default.warn(`Collaboration not found for unavailable days update: ${collabId}`);
                    throw new error_handler_1.RepositoryError(`Collaboration not found with ID: ${collabId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Unavailable days updated for collaboration: ${collabId}`);
                return collab;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating unavailable days for collaboration ${collabId}`, err);
                throw new error_handler_1.RepositoryError("Error updating unavailable days", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateTemporarySlotChanges = async (collabId, updateData) => {
            try {
                logger_1.default.debug(`Updating temporary slot changes for collaboration: ${collabId}`);
                const collab = await this.findByIdAndUpdate(collabId, {
                    $push: {
                        temporarySlotChanges: {
                            datesAndNewSlots: updateData.datesAndNewSlots,
                            requestedBy: updateData.requestedBy,
                            requesterId: this.toObjectId(updateData.requesterId),
                            approvedById: this.toObjectId(updateData.approvedById),
                            isApproved: updateData.isApproved,
                        },
                    },
                }, { new: true });
                if (!collab) {
                    logger_1.default.warn(`Collaboration not found for temporary slot changes update: ${collabId}`);
                    throw new error_handler_1.RepositoryError(`Collaboration not found with ID: ${collabId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Temporary slot changes updated for collaboration: ${collabId}`);
                return collab;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating temporary slot changes for collaboration ${collabId}`, err);
                throw new error_handler_1.RepositoryError("Error updating temporary slot changes", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateRequestStatus = async (collabId, requestId, requestType, status, newEndDate) => {
            try {
                logger_1.default.debug(`Updating request status for collaboration: ${collabId}, request: ${requestId}`);
                const updateField = requestType === "unavailable" ? "unavailableDays" : "temporarySlotChanges";
                const updateQuery = {
                    $set: {
                        [`${updateField}.$.isApproved`]: status,
                    },
                };
                if (newEndDate) {
                    updateQuery.$set["endDate"] = newEndDate;
                }
                const collab = await this.model
                    .findOneAndUpdate({
                    _id: this.toObjectId(collabId),
                    [`${updateField}._id`]: this.toObjectId(requestId),
                }, updateQuery, { new: true })
                    .populate({
                    path: "mentorId",
                    model: "Mentor",
                    populate: { path: "userId", model: "User" },
                })
                    .populate({ path: "userId", model: "User" })
                    .exec();
                if (!collab) {
                    logger_1.default.warn(`Collaboration not found for request status update: ${collabId}`);
                    throw new error_handler_1.RepositoryError(`Collaboration not found with ID: ${collabId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Request status updated for collaboration: ${collabId}, request: ${requestId}`);
                return collab;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating request status for collaboration ${collabId}`, err);
                throw new error_handler_1.RepositoryError("Error updating request status", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getLockedSlotsByMentorId = async (mentorId) => {
            try {
                logger_1.default.debug(`Fetching locked slots for mentor: ${mentorId}`);
                const currentDate = new Date();
                const collaborations = await this.model
                    .find({
                    mentorId: this.toObjectId(mentorId),
                    isCancelled: false,
                    $or: [{ endDate: { $gt: currentDate } }, { endDate: null }],
                })
                    .select("selectedSlot")
                    .exec();
                const mentorRequests = await this._mentorRequestModel
                    .find({
                    mentorId: this.toObjectId(mentorId),
                    isAccepted: "Accepted",
                })
                    .select("selectedSlot")
                    .exec();
                const collabSlots = collaborations.flatMap((collab) => collab.selectedSlot.map((slot) => ({
                    day: slot.day,
                    timeSlots: slot.timeSlots,
                })));
                const requestSlots = mentorRequests
                    .map((request) => {
                    const selectedSlot = request.selectedSlot;
                    if (!selectedSlot.day || !selectedSlot.timeSlots) {
                        logger_1.default.warn(`Invalid selectedSlot for mentorRequestId: ${request._id}`);
                        return null;
                    }
                    return {
                        day: selectedSlot.day,
                        timeSlots: [selectedSlot.timeSlots],
                    };
                })
                    .filter((slot) => slot !== null);
                const allSlots = [...collabSlots, ...requestSlots];
                const uniqueSlots = [];
                allSlots.forEach((slot) => {
                    const existing = uniqueSlots.find((s) => s.day === slot.day);
                    if (existing) {
                        existing.timeSlots = Array.from(new Set([...existing.timeSlots, ...slot.timeSlots]));
                    }
                    else {
                        uniqueSlots.push({ day: slot.day, timeSlots: slot.timeSlots });
                    }
                });
                logger_1.default.info(`Fetched ${uniqueSlots.length} locked slots for mentorId: ${mentorId}`);
                return uniqueSlots;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching locked slots for mentorId ${mentorId}`, err);
                throw new error_handler_1.RepositoryError("Error fetching locked slots", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findByMentorId = async (mentorId) => {
            try {
                logger_1.default.debug(`Fetching collaborations for mentor: ${mentorId}`);
                const collaborations = await this.model
                    .find({ mentorId: this.toObjectId(mentorId), isCancelled: false })
                    .populate("userId", "_id name email")
                    .populate("mentorId", "userId")
                    .exec();
                logger_1.default.info(`Fetched ${collaborations.length} collaborations for mentorId: ${mentorId}`);
                return collaborations;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching collaborations for mentorId ${mentorId}`, err);
                throw new error_handler_1.RepositoryError("Error fetching collaborations", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findByDateRange = async (startDate, endDate) => {
            try {
                logger_1.default.debug(`Fetching collaborations from ${startDate} to ${endDate}`);
                const collaborations = await this.model
                    .find({ createdAt: { $gte: startDate, $lte: endDate }, isCancelled: false })
                    .populate("userId")
                    .populate("mentorId")
                    .exec();
                logger_1.default.info(`Fetched ${collaborations.length} collaborations for date range`);
                return collaborations;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching collaborations by date range`, err);
                throw new error_handler_1.RepositoryError("Error fetching collaborations", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getMentorIdAndUserId = async (collaborationId) => {
            try {
                logger_1.default.debug(`Fetching mentor and user IDs for collaboration: ${collaborationId}`);
                const collaborationData = (await this.model.findById(this.toObjectId(collaborationId))
                    .populate({ path: "mentorId", select: "userId" })
                    .select("userId mentorId")
                    .exec());
                if (!collaborationData) {
                    logger_1.default.warn(`Collaboration not found: ${collaborationId}`);
                    return null;
                }
                const result = {
                    userId: collaborationData.userId.toString(),
                    mentorUserId: collaborationData.mentorId?.userId?.toString() || null,
                };
                logger_1.default.info(`Fetched user IDs for collaboration: ${collaborationId}`);
                return result;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching collaboration IDs for collaboration ${collaborationId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching collaboration IDs', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._mentorRequestModel = mentor_requset_model_1.default;
    }
};
exports.CollaborationRepository = CollaborationRepository;
exports.CollaborationRepository = CollaborationRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], CollaborationRepository);
//# sourceMappingURL=collaboration-repository.js.map