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
exports.FeedbackRepository = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const feedback_model_1 = __importDefault(require("../Models/feedback-model"));
const status_code_enums_1 = require("../enums/status-code-enums");
let FeedbackRepository = class FeedbackRepository extends base_repositry_1.BaseRepository {
    constructor() {
        super(feedback_model_1.default);
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
        this.createFeedback = async (feedbackData) => {
            try {
                logger_1.default.debug(`Creating feedback for collaboration: ${feedbackData.collaborationId}`);
                const feedback = await this.create({
                    ...feedbackData,
                    userId: feedbackData.userId ? this.toObjectId(feedbackData.userId) : undefined,
                    mentorId: feedbackData.mentorId ? this.toObjectId(feedbackData.mentorId) : undefined,
                    collaborationId: feedbackData.collaborationId ? this.toObjectId(feedbackData.collaborationId) : undefined,
                    createdAt: new Date(),
                });
                logger_1.default.info(`Feedback created: ${feedback._id}`);
                return feedback;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating feedback for collaboration ${feedbackData.collaborationId}`, err);
                throw new error_handler_1.RepositoryError('Error creating feedback', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getFeedbacksByMentorId = async (mentorId) => {
            try {
                logger_1.default.debug(`Fetching feedbacks for mentor: ${mentorId}`);
                const feedbacks = await this.model
                    .find({ mentorId: this.toObjectId(mentorId) })
                    .populate('userId', '_id name email profilePic')
                    .sort({ createdAt: -1 })
                    .exec();
                logger_1.default.info(`Fetched ${feedbacks.length} feedbacks for mentorId: ${mentorId}`);
                return feedbacks;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching feedbacks for mentorId ${mentorId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching feedbacks by mentor ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getFeedbacksByUserId = async (userId) => {
            try {
                logger_1.default.debug(`Fetching feedbacks for user: ${userId}`);
                const feedbacks = await this.model
                    .find({ userId: this.toObjectId(userId) })
                    .populate('mentorId', '_id name profilePic')
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .exec();
                logger_1.default.info(`Fetched ${feedbacks.length} feedbacks for userId: ${userId}`);
                return feedbacks;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching feedbacks for userId ${userId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching feedbacks by user ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getFeedbackByCollaborationId = async (collaborationId) => {
            try {
                logger_1.default.debug(`Fetching feedbacks for collaboration: ${collaborationId}`);
                const feedbacks = await this.model
                    .find({ collaborationId: this.toObjectId(collaborationId) })
                    .populate('mentorId', '_id name email profilePic')
                    .populate('userId', '_id name email profilePic')
                    .exec();
                logger_1.default.info(`Fetched ${feedbacks.length} feedbacks for collaborationId: ${collaborationId}`);
                return feedbacks;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching feedbacks for collaborationId ${collaborationId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching feedbacks by collaboration ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getMentorAverageRating = async (mentorId) => {
            try {
                logger_1.default.debug(`Calculating average rating for mentor: ${mentorId}`);
                const result = await this.model.aggregate([
                    { $match: { mentorId: this.toObjectId(mentorId) } },
                    {
                        $group: {
                            _id: null,
                            averageRating: { $avg: '$rating' },
                            averageCommunication: { $avg: '$communication' },
                            averageExpertise: { $avg: '$expertise' },
                            averagePunctuality: { $avg: '$punctuality' },
                        },
                    },
                ]);
                const averageRating = result[0]?.averageRating || 0;
                logger_1.default.info(`Calculated average rating for mentorId ${mentorId}: ${averageRating}`);
                return averageRating;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error calculating average rating for mentorId ${mentorId}`, err);
                throw new error_handler_1.RepositoryError('Error calculating mentor average rating', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getFeedbackForProfile = async (profileId, profileType) => {
            try {
                logger_1.default.debug(`Fetching feedbacks for profile: ${profileId}, type: ${profileType}`);
                const query = profileType === 'mentor'
                    ? { mentorId: this.toObjectId(profileId), isHidden: false }
                    : { userId: this.toObjectId(profileId), isHidden: false };
                const feedbacks = await this.model
                    .find(query)
                    .populate('userId', '_id name email profilePic')
                    .populate({
                    path: 'mentorId',
                    populate: {
                        path: 'userId',
                        select: '_id name email profilePic',
                    },
                })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .exec();
                logger_1.default.info(`Fetched ${feedbacks.length} feedbacks for profileId: ${profileId}, type: ${profileType}`);
                return feedbacks;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching feedbacks for profileId ${profileId}, type ${profileType}`, err);
                throw new error_handler_1.RepositoryError('Error fetching feedbacks for profile', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.toggleIsHidden = async (feedbackId) => {
            try {
                logger_1.default.debug(`Toggling isHidden for feedback: ${feedbackId}`);
                const feedback = await this.findById(feedbackId);
                if (!feedback) {
                    logger_1.default.warn(`Feedback not found: ${feedbackId}`);
                    throw new error_handler_1.RepositoryError(`Feedback not found with ID: ${feedbackId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                feedback.isHidden = !feedback.isHidden;
                const updatedFeedback = await feedback.save();
                logger_1.default.info(`isHidden toggled for feedback: ${feedbackId}, new status: ${updatedFeedback.isHidden}`);
                return updatedFeedback;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error toggling isHidden for feedback ${feedbackId}`, err);
                throw new error_handler_1.RepositoryError('Error toggling isHidden for feedback', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
    }
};
exports.FeedbackRepository = FeedbackRepository;
exports.FeedbackRepository = FeedbackRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], FeedbackRepository);
//# sourceMappingURL=feedback-repository.js.map