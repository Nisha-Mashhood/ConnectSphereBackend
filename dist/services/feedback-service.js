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
exports.FeedbackService = void 0;
const inversify_1 = require("inversify");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const status_code_enums_1 = require("../enums/status-code-enums");
const feedback_mapper_1 = require("../Utils/mappers/feedback-mapper");
let FeedbackService = class FeedbackService {
    constructor(feedbackRepository, collaborationrepository) {
        this.createFeedback = async (feedbackData) => {
            try {
                logger_1.default.debug(`Creating feedback for collaboration: ${feedbackData.collaborationId}`);
                const collabId = feedbackData.collaborationId?.toString();
                if (!collabId) {
                    logger_1.default.error(" missing collaboration ID");
                    throw new error_handler_1.ServiceError("Collaboration ID is required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const collabDetails = await this._collabRepository.findById(collabId);
                if (!collabDetails) {
                    logger_1.default.error(`Collaboration not found: ${collabId}`);
                    throw new error_handler_1.ServiceError("Collaboration not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const today = new Date();
                if (collabDetails.endDate && new Date(collabDetails.endDate) <= today) {
                    logger_1.default.debug(`Updating collaboration feedback status: ${collabId}`);
                    await this._collabRepository.updateCollabFeedback(collabId);
                }
                const feedback = await this._feedbackRepository.createFeedback(feedbackData);
                const feedbackDTO = (0, feedback_mapper_1.toFeedbackDTO)(feedback);
                if (!feedbackDTO) {
                    logger_1.default.error(`Failed to map feedback ${feedback._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map feedback to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Feedback created: ${feedback._id}`);
                return feedbackDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating feedback for collaboration ${feedbackData.collaborationId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to create feedback", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getMentorFeedbacks = async (mentorId) => {
            try {
                logger_1.default.debug(`Fetching feedbacks for mentor: ${mentorId}`);
                const feedbacks = await this._feedbackRepository.getFeedbacksByMentorId(mentorId);
                const feedbacksDTO = (0, feedback_mapper_1.toFeedbackDTOs)(feedbacks);
                const averageRating = await this._feedbackRepository.getMentorAverageRating(mentorId);
                logger_1.default.info(`Fetched ${feedbacksDTO.length} feedbacks for mentor: ${mentorId}`);
                return {
                    feedbacks: feedbacksDTO,
                    averageRating,
                    totalFeedbacks: feedbacksDTO.length,
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching mentor feedbacks for mentor ${mentorId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch mentor feedbacks", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getUserFeedbacks = async (userId) => {
            try {
                logger_1.default.debug(`Fetching feedbacks for user: ${userId}`);
                const feedbacks = await this._feedbackRepository.getFeedbacksByUserId(userId);
                const feedbacksDTO = (0, feedback_mapper_1.toFeedbackDTOs)(feedbacks);
                logger_1.default.info(`Fetched ${feedbacksDTO.length} feedbacks for user: ${userId}`);
                return feedbacksDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching user feedbacks for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch user feedbacks", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getFeedbackForProfile = async (profileId, profileType) => {
            try {
                logger_1.default.debug(`Fetching feedbacks for profile: ${profileId}, type: ${profileType}`);
                if (!["mentor", "user"].includes(profileType)) {
                    logger_1.default.error(`Invalid profile type: ${profileType}`);
                    throw new error_handler_1.ServiceError("Invalid profile type", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const feedbacks = await this._feedbackRepository.getFeedbackForProfile(profileId, profileType);
                const feedbacksDTO = (0, feedback_mapper_1.toFeedbackDTOs)(feedbacks);
                logger_1.default.info(`Fetched ${feedbacksDTO.length} feedbacks for profile: ${profileId}`);
                return {
                    feedbacks: feedbacksDTO,
                    totalFeedbacks: feedbacksDTO.length,
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching feedbacks for profile ${profileId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch feedbacks for profile", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getFeedbackByCollaborationId = async (collabId) => {
            try {
                logger_1.default.debug(`Fetching feedbacks for collaboration: ${collabId}`);
                const feedbacks = await this._feedbackRepository.getFeedbackByCollaborationId(collabId);
                const feedbacksDTO = (0, feedback_mapper_1.toFeedbackDTOs)(feedbacks);
                logger_1.default.info(`Fetched ${feedbacksDTO.length} feedbacks for collaboration: ${collabId}`);
                return feedbacksDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching feedbacks by collaboration ID ${collabId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch feedbacks by collaboration ID", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.toggleFeedback = async (feedbackId) => {
            try {
                logger_1.default.debug(`Toggling feedback visibility: ${feedbackId}`);
                const feedback = await this._feedbackRepository.toggleIsHidden(feedbackId);
                if (!feedback) {
                    logger_1.default.error(`Feedback not found: ${feedbackId}`);
                    throw new error_handler_1.ServiceError("Feedback not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const feedbackDTO = (0, feedback_mapper_1.toFeedbackDTO)(feedback);
                if (!feedbackDTO) {
                    logger_1.default.error(`Failed to map feedback ${feedback._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map feedback to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Toggled feedback visibility: ${feedbackId}`);
                return feedbackDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error toggling feedback visibility for feedback ${feedbackId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to toggle feedback visibility", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getFeedbackByMentorId = async (mentorId) => {
            try {
                logger_1.default.debug(`Fetching feedbacks by mentor ID: ${mentorId}`);
                const feedbacks = await this._feedbackRepository.getFeedbacksByMentorId(mentorId);
                const feedbacksDTO = (0, feedback_mapper_1.toFeedbackDTOs)(feedbacks);
                logger_1.default.info(`Fetched ${feedbacksDTO.length} feedbacks for mentor: ${mentorId}`);
                return feedbacksDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching feedbacks by mentor ID ${mentorId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch feedbacks by mentor ID", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._feedbackRepository = feedbackRepository;
        this._collabRepository = collaborationrepository;
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IFeedbackRepository')),
    __param(1, (0, inversify_1.inject)('ICollaborationRepository')),
    __metadata("design:paramtypes", [Object, Object])
], FeedbackService);
//# sourceMappingURL=feedback-service.js.map