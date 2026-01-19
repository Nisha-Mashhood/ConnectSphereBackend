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
exports.MentorRepository = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const mentor_model_1 = __importDefault(require("../Models/mentor-model"));
const status_code_enums_1 = require("../enums/status-code-enums");
let MentorRepository = class MentorRepository extends base_repositry_1.BaseRepository {
    constructor() {
        super(mentor_model_1.default);
        this.toObjectId = (id) => {
            if (!id) {
                logger_1.default.warn('Missing ID when converting to ObjectId');
                throw new error_handler_1.RepositoryError('Invalid ID: ID is required', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            let idStr;
            if (typeof id === 'string') {
                idStr = id;
            }
            else if (id instanceof mongoose_1.Types.ObjectId) {
                idStr = id.toString();
            }
            else if (typeof id === 'object' && '_id' in id) {
                idStr = id._id.toString();
            }
            else {
                logger_1.default.warn(`Invalid ID type: ${typeof id}`);
                throw new error_handler_1.RepositoryError('Invalid ID: must be a string, ObjectId', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            if (!mongoose_1.Types.ObjectId.isValid(idStr)) {
                logger_1.default.warn(`Invalid ObjectId format: ${idStr}`);
                throw new error_handler_1.RepositoryError('Invalid ID: must be a 24 character hex string', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            return new mongoose_1.Types.ObjectId(idStr);
        };
        // public submitMentorRequest = async (data: Partial<IMentor>, options?: { session?: ClientSession }): Promise<IMentor> => {
        //   try {
        //     logger.debug(`Submitting mentor request for user: ${data.userId}`);
        //     const mentor = await this.create({
        //       ...data,
        //       userId: this.toObjectId(data.userId),
        //     }, options?.session);
        //     logger.info(`Mentor request submitted: ${mentor._id}`);
        //     return mentor;
        //   } catch (error: unknown) {
        //     const err = error instanceof Error ? error : new Error(String(error));
        //     logger.error(`Error submitting mentor request for user ${data.userId}`, err);
        //     throw new RepositoryError('Error submitting mentor request', StatusCodes.INTERNAL_SERVER_ERROR, err);
        //   }
        // }
        this.saveMentorRequest = async (data, options) => {
            try {
                logger_1.default.debug(`Saving mentor request for user: ${data.userId}`);
                const mentor = await this.create({
                    ...data,
                    userId: this.toObjectId(data.userId),
                }, options?.session);
                logger_1.default.info(`Mentor request saved: ${mentor._id}`);
                return mentor;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error saving mentor request for user ${data.userId}`, err);
                throw new error_handler_1.RepositoryError('Error saving mentor request', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllMentorRequests = async (page = 1, limit = 10, search = "", status = "", sort = "desc") => {
            try {
                logger_1.default.debug(`Fetching mentor requests: page=${page}, limit=${limit}, search="${search}", status="${status}"`);
                const pipeline = [];
                const match = {};
                if (status)
                    match.isApproved = status;
                pipeline.push({ $match: match });
                pipeline.push({
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: 'userId',
                    },
                });
                pipeline.push({ $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } });
                pipeline.push({
                    $lookup: {
                        from: "skills",
                        localField: "skills",
                        foreignField: "_id",
                        as: 'skills',
                    },
                });
                if (search) {
                    pipeline.push({
                        $match: {
                            $or: [
                                { "userId.name": { $regex: search, $options: "i" } },
                                { "userId.email": { $regex: search, $options: "i" } },
                            ],
                        },
                    });
                }
                pipeline.push({
                    $facet: {
                        metadata: [{ $count: "total" }],
                        data: [
                            { $sort: { createdAt: sort === "desc" ? -1 : 1 } },
                            { $skip: (page - 1) * limit },
                            { $limit: limit },
                            {
                                $project: {
                                    id: "$_id",
                                    mentorId: 1,
                                    userId: 1,
                                    isApproved: 1,
                                    rejectionReason: 1,
                                    bio: 1,
                                    price: 1,
                                    timePeriod: 1,
                                    availableSlots: 1,
                                    certifications: 1,
                                    specialization: 1,
                                    createdAt: 1,
                                    updatedAt: 1,
                                    skills: 1,
                                },
                            },
                        ],
                    },
                });
                const [result] = await this.model.aggregate(pipeline).exec();
                const total = result.metadata[0]?.total ?? 0;
                const mentors = result.data ?? [];
                logger_1.default.info(`Fetched ${mentors.length} mentors, total: ${total}`);
                return {
                    mentors,
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error fetching mentor requests", err);
                throw new error_handler_1.RepositoryError("Error fetching mentor requests", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllMentors = async (query = {}) => {
            try {
                logger_1.default.debug(`Fetching all approved mentors with query: ${JSON.stringify(query)}`);
                const { search, page = 1, limit = 10, skill, category, sortBy = "feedbackCount", sortOrder = "desc", excludeMentorId, } = query;
                logger_1.default.info(`Selected category: ${category || 'None'}, Skill: ${skill || 'None'}`);
                const matchStage = { isApproved: 'Completed' };
                if (search) {
                    matchStage['userId.name'] = { $regex: search, $options: 'i' };
                }
                if (excludeMentorId) {
                    logger_1.default.info(`Excluded mentorId: ${excludeMentorId}`);
                    matchStage['_id'] = { $ne: this.toObjectId(excludeMentorId) };
                }
                const pipeline = [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'userId',
                            pipeline: [{ $project: { id: 1, name: 1, email: 1, profilePic: 1 } }],
                        },
                    },
                    { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: 'skills',
                            localField: 'skills',
                            foreignField: '_id',
                            as: 'skills',
                            pipeline: [{ $project: { id: 1, name: 1, subcategoryId: 1 } }],
                        },
                    },
                    {
                        $lookup: {
                            from: 'feedbacks',
                            localField: '_id',
                            foreignField: 'mentorId',
                            as: 'feedbacks',
                        },
                    },
                    {
                        $addFields: {
                            avgRating: { $avg: '$feedbacks.rating' },
                            feedbackCount: { $size: '$feedbacks' },
                        },
                    },
                ];
                if (skill || category) {
                    pipeline.push({
                        $lookup: {
                            from: 'subcategories',
                            localField: 'skills.subcategoryId',
                            foreignField: '_id',
                            as: 'subcategories',
                        },
                    });
                    pipeline.push({
                        $lookup: {
                            from: 'categories',
                            localField: 'subcategories.categoryId',
                            foreignField: '_id',
                            as: 'categories',
                        },
                    });
                    const filterStage = {};
                    if (skill) {
                        filterStage['skills.name'] = { $regex: `^${skill}$`, $options: 'i' };
                        logger_1.default.info(`Applying skill filter: ${skill}`);
                    }
                    if (category) {
                        filterStage['categories.name'] = { $regex: `^${category}$`, $options: 'i' };
                        logger_1.default.info(`Applying category filter: ${category}`);
                    }
                    if (skill || category) {
                        pipeline.push({ $match: filterStage });
                    }
                }
                pipeline.push({ $match: matchStage });
                pipeline.push({
                    $addFields: {
                        id: '$_id',
                    },
                });
                pipeline.push({
                    $project: {
                        _id: 0,
                        id: 1,
                        'userId._id': 1,
                        'userId.name': 1,
                        'userId.email': 1,
                        'userId.profilePic': 1,
                        'skills._id': 1,
                        'skills.name': 1,
                        'skills.subcategoryId': 1,
                        'categories.name': 1,
                        price: 1,
                        avgRating: 1,
                        feedbackCount: 1,
                        specialization: 1,
                        timePeriod: 1,
                        availableSlots: 1,
                    },
                });
                const sortStage = {};
                if (sortBy === 'rating') {
                    sortStage.avgRating = sortOrder === 'asc' ? 1 : -1;
                    sortStage.feedbackCount = -1;
                }
                else if (sortBy === 'price') {
                    sortStage.price = sortOrder === 'asc' ? 1 : -1;
                }
                else if (sortBy === 'feedbackCount') {
                    sortStage.feedbackCount = sortOrder === 'asc' ? 1 : -1;
                    sortStage.avgRating = -1;
                }
                else {
                    sortStage['userId.name'] = sortOrder === 'asc' ? 1 : -1;
                }
                pipeline.push({ $sort: sortStage });
                pipeline.push({
                    $facet: {
                        mentors: [{ $skip: (page - 1) * limit }, { $limit: limit }],
                        total: [{ $count: 'count' }],
                    },
                });
                const result = await this.model.aggregate(pipeline).exec();
                const mentors = result[0]?.mentors || [];
                const total = result[0]?.total[0]?.count || 0;
                logger_1.default.info(`Fetched ${mentors.length} mentors, total: ${total}`);
                return { mentors, total };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching mentors`, err);
                throw new error_handler_1.RepositoryError('Error fetching mentors', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getMentorDetails = async (id) => {
            try {
                logger_1.default.debug(`Fetching mentor details for ID: ${id}`);
                const mentor = await this.model
                    .findById(this.toObjectId(id))
                    .populate("userId")
                    .populate("skills")
                    .exec();
                logger_1.default.info(`Mentor details ${mentor ? 'found' : 'not found'}: ${id}`);
                return mentor;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching mentor details for ID ${id}`, err);
                throw new error_handler_1.RepositoryError('Error fetching mentor details', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.approveMentorRequest = async (id) => {
            try {
                logger_1.default.debug(`Approving mentor request: ${id}`);
                const updatedMentor = await this.model
                    .findByIdAndUpdate(this.toObjectId(id), { isApproved: "Completed" }, { new: true })
                    .exec();
                if (!updatedMentor) {
                    logger_1.default.warn(`Mentor not found: ${id}`);
                    throw new error_handler_1.RepositoryError(`Mentor not found with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Mentor request approved: ${id}`);
                return updatedMentor;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error approving mentor request for ID ${id}`, err);
                throw new error_handler_1.RepositoryError('Error approving mentor request', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.rejectMentorRequest = async (id) => {
            try {
                logger_1.default.debug(`Rejecting mentor request: ${id}`);
                const updatedMentor = await this.model
                    .findByIdAndUpdate(this.toObjectId(id), { isApproved: "Rejected" }, { new: true })
                    .exec();
                if (!updatedMentor) {
                    logger_1.default.warn(`Mentor not found: ${id}`);
                    throw new error_handler_1.RepositoryError(`Mentor not found with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Mentor request rejected: ${id}`);
                return updatedMentor;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error rejecting mentor request for ID ${id}`, err);
                throw new error_handler_1.RepositoryError('Error rejecting mentor request', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.cancelMentorship = async (id, options) => {
            try {
                logger_1.default.debug(`Cancelling mentorship: ${id}`);
                const updatedMentor = await this.model
                    .findByIdAndUpdate(this.toObjectId(id), { isApproved: "Processing" }, { new: true, session: options?.session })
                    .exec();
                if (!updatedMentor) {
                    logger_1.default.warn(`Mentor not found: ${id}`);
                    throw new error_handler_1.RepositoryError(`Mentor not found with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Mentorship cancelled: ${id}`);
                return updatedMentor;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error cancelling mentorship for ID ${id}`, err);
                throw new error_handler_1.RepositoryError('Error cancelling mentorship', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getMentorById = async (id) => {
            try {
                logger_1.default.debug(`Fetching mentor by ID: ${id}`);
                const mentor = await this.model
                    .findById(this.toObjectId(id))
                    .populate("userId", "_id name email profilePic coverPic")
                    .populate("skills", "_id name")
                    .exec();
                logger_1.default.info(`Mentor ${mentor ? 'found' : 'not found'}: ${id}`);
                return mentor;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching mentor by ID ${id}`, err);
                throw new error_handler_1.RepositoryError('Error fetching mentor by ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getMentorByUserId = async (userId) => {
            try {
                logger_1.default.debug(`Fetching mentor by user ID: ${userId}`);
                const mentor = await this.model
                    .findOne({ userId: this.toObjectId(userId) })
                    .populate("userId")
                    .populate("skills")
                    .exec();
                logger_1.default.info(`Mentor ${mentor ? 'found' : 'not found'} for userId: ${userId}`);
                return mentor;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching mentor by user ID ${userId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching mentor by user ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateMentorById = async (mentorId, updateData) => {
            try {
                logger_1.default.debug(`Updating mentor: ${mentorId}`);
                const updatedMentor = await this.findByIdAndUpdate(mentorId, updateData, { new: true });
                if (!updatedMentor) {
                    logger_1.default.warn(`Mentor not found: ${mentorId}`);
                    throw new error_handler_1.RepositoryError(`Mentor not found with ID: ${mentorId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Mentor updated: ${mentorId}`);
                return updatedMentor;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating mentor ${mentorId}`, err);
                throw new error_handler_1.RepositoryError('Error updating mentor', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
    }
};
exports.MentorRepository = MentorRepository;
exports.MentorRepository = MentorRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], MentorRepository);
//# sourceMappingURL=mentor-repository.js.map