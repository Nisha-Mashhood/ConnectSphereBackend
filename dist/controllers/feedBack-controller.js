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
exports.FeedbackController = void 0;
const inversify_1 = require("inversify");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const base_controller_1 = require("../core/controller/base-controller");
const messages_1 = require("../constants/messages");
const error_messages_1 = require("../constants/error-messages");
let FeedbackController = class FeedbackController extends base_controller_1.BaseController {
    constructor(feedbackService) {
        super();
        this.createFeedback = async (req, res, next) => {
            try {
                const feedbackData = {
                    userId: req.body.userId,
                    mentorId: req.body.mentorId,
                    collaborationId: req.body.collaborationId,
                    rating: req.body.rating,
                    communication: req.body.communication,
                    expertise: req.body.expertise,
                    punctuality: req.body.punctuality,
                    comments: req.body.comments,
                    wouldRecommend: req.body.wouldRecommend,
                    givenBy: req.body.role,
                };
                logger_1.default.debug(`Creating feedback for collaboration: ${feedbackData.collaborationId}`);
                if (!feedbackData.userId || !feedbackData.mentorId || !feedbackData.collaborationId || !feedbackData.rating) {
                    logger_1.default.error("Missing required fields");
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_FEEDBACK_FIELDS, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const feedback = await this._feedbackService.createFeedback(feedbackData);
                this.sendCreated(res, { feedback }, messages_1.FEEDBACK_MESSAGES.FEEDBACK_CREATED);
                logger_1.default.info("Feedback created successfully");
            }
            catch (error) {
                logger_1.default.error(`Error creating feedback: ${error.message}`);
                next(error);
            }
        };
        this.getMentorFeedbacks = async (req, res, next) => {
            try {
                const { mentorId } = req.params;
                logger_1.default.debug(`Fetching feedbacks for mentor: ${mentorId}`);
                const feedbackData = await this._feedbackService.getMentorFeedbacks(mentorId);
                if (feedbackData.feedbacks.length === 0) {
                    this.sendSuccess(res, { feedbacks: [], averageRating: 0, totalFeedbacks: 0 }, messages_1.FEEDBACK_MESSAGES.NO_FEEDBACKS_FOUND);
                    return;
                }
                this.sendSuccess(res, feedbackData, messages_1.FEEDBACK_MESSAGES.MENTOR_FEEDBACKS_FETCHED);
                logger_1.default.info("Mentor feedbacks fetched successfully");
            }
            catch (error) {
                logger_1.default.error(`Error fetching mentor feedbacks: ${error.message}`);
                next(error);
            }
        };
        this.getUserFeedbacks = async (req, res, next) => {
            try {
                const { userId } = req.params;
                logger_1.default.debug(`Fetching feedbacks for user: ${userId}`);
                const feedbacks = await this._feedbackService.getUserFeedbacks(userId);
                if (feedbacks.length === 0) {
                    this.sendSuccess(res, { feedbacks: [] }, messages_1.FEEDBACK_MESSAGES.NO_FEEDBACKS_FOUND);
                    return;
                }
                this.sendSuccess(res, { feedbacks }, messages_1.FEEDBACK_MESSAGES.USER_FEEDBACKS_FETCHED);
                logger_1.default.info("User feedbacks fetched successfully");
            }
            catch (error) {
                logger_1.default.error(`Error fetching user feedbacks: ${error.message}`);
                next(error);
            }
        };
        this.getFeedbackForProfile = async (req, res, next) => {
            try {
                const { profileId, profileType } = req.params;
                logger_1.default.debug(`Fetching feedbacks for profile: ${profileId}, type: ${profileType}`);
                if (!["mentor", "user"].includes(profileType)) {
                    logger_1.default.error(`Invalid profile type: ${profileType}`);
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.INVALID_PROFILE_TYPE, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const feedbackData = await this._feedbackService.getFeedbackForProfile(profileId, profileType);
                if (feedbackData.feedbacks.length === 0) {
                    this.sendSuccess(res, { feedbacks: [], totalFeedbacks: 0 }, messages_1.FEEDBACK_MESSAGES.NO_FEEDBACKS_FOUND);
                    return;
                }
                this.sendSuccess(res, feedbackData, messages_1.FEEDBACK_MESSAGES.PROFILE_FEEDBACKS_FETCHED);
                logger_1.default.info("Profile feedbacks fetched successfully");
            }
            catch (error) {
                logger_1.default.error(`Error fetching profile feedbacks: ${error.message}`);
                next(error);
            }
        };
        this.getFeedbackByCollaborationId = async (req, res, next) => {
            try {
                const { collabId } = req.params;
                logger_1.default.debug(`Fetching feedbacks for collaboration: ${collabId}`);
                const feedbacks = await this._feedbackService.getFeedbackByCollaborationId(collabId);
                if (feedbacks.length === 0) {
                    this.sendSuccess(res, { feedbacks: [] }, messages_1.FEEDBACK_MESSAGES.NO_FEEDBACKS_FOUND);
                    return;
                }
                this.sendSuccess(res, { feedbacks }, messages_1.FEEDBACK_MESSAGES.COLLABORATION_FEEDBACKS_FETCHED);
                logger_1.default.info("Collaboration feedbacks fetched successfully");
            }
            catch (error) {
                logger_1.default.error(`Error fetching collaboration feedbacks: ${error.message}`);
                next(error);
            }
        };
        this.toggleFeedback = async (req, res, next) => {
            try {
                const { feedbackId } = req.params;
                logger_1.default.debug(`Toggling feedback visibility: ${feedbackId}`);
                const feedback = await this._feedbackService.toggleFeedback(feedbackId);
                this.sendSuccess(res, { feedback }, messages_1.FEEDBACK_MESSAGES.FEEDBACK_VISIBILITY_TOGGLED);
                logger_1.default.info(`Feedback visibility toggled for: ${feedbackId}`);
            }
            catch (error) {
                logger_1.default.error(`Error toggling feedback visibility: ${error.message}`);
                next(error);
            }
        };
        this.getFeedbackByMentorId = async (req, res, next) => {
            try {
                const { mentorId } = req.params;
                logger_1.default.debug(`Fetching feedbacks by mentor ID: ${mentorId}`);
                const feedbacks = await this._feedbackService.getFeedbackByMentorId(mentorId);
                if (feedbacks.length === 0) {
                    this.sendSuccess(res, { feedbacks: [] }, messages_1.FEEDBACK_MESSAGES.NO_FEEDBACKS_FOUND);
                    return;
                }
                this.sendSuccess(res, { feedbacks }, messages_1.FEEDBACK_MESSAGES.FEEDBACKS_BY_MENTOR_FETCHED);
                logger_1.default.info("Feedbacks fetched successfully");
            }
            catch (error) {
                logger_1.default.error(`Error fetching feedbacks by mentor ID: ${error.message}`);
                next(error);
            }
        };
        this._feedbackService = feedbackService;
    }
};
exports.FeedbackController = FeedbackController;
exports.FeedbackController = FeedbackController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IFeedbackService')),
    __metadata("design:paramtypes", [Object])
], FeedbackController);
//# sourceMappingURL=feedBack-controller.js.map