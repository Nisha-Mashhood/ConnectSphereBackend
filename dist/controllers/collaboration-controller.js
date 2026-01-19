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
exports.CollaborationController = void 0;
const base_controller_1 = require("../core/controller/base-controller");
const mentor_requset_model_1 = __importDefault(require("../Models/mentor-requset-model"));
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const inversify_1 = require("inversify");
const messages_1 = require("../constants/messages");
const error_messages_1 = require("../constants/error-messages");
let CollaborationController = class CollaborationController extends base_controller_1.BaseController {
    constructor(collaborationService) {
        super();
        this.TemporaryRequestController = async (req, res, next) => {
            try {
                const { mentorId, userId, selectedSlot, price, timePeriod } = req.body;
                logger_1.default.info(req.body);
                const requestData = { mentorId, userId, selectedSlot, price, timePeriod };
                const newRequest = await this._collabService.TemporaryRequestService(requestData);
                this.sendCreated(res, newRequest, messages_1.COLLABORATION_MESSAGES.REQUEST_CREATED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMentorRequestsController = async (req, res, next) => {
            try {
                const mentorId = req.query.mentorId;
                if (!mentorId) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.MENTOR_ID_REQUIRED, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const mentorRequests = await this._collabService.getMentorRequests(mentorId);
                if (mentorRequests.length === 0) {
                    this.sendSuccess(res, { requests: [] }, messages_1.COLLABORATION_MESSAGES.NO_MENTOR_REQUESTS_FOUND);
                    logger_1.default.info(`No mentor requests found for mentorId: ${mentorId}`);
                    return;
                }
                this.sendSuccess(res, { requests: mentorRequests }, messages_1.COLLABORATION_MESSAGES.MENTOR_REQUESTS_RETRIEVED);
            }
            catch (error) {
                next(error);
            }
        };
        this.acceptRequestController = async (req, res, next) => {
            try {
                const { id } = req.params;
                const request = await this._collabService.acceptRequest(id);
                this.sendSuccess(res, { request }, messages_1.COLLABORATION_MESSAGES.REQUEST_ACCEPTED);
            }
            catch (error) {
                next(error);
            }
        };
        this.rejectRequestController = async (req, res, next) => {
            try {
                const { id } = req.params;
                const request = await this._collabService.rejectRequest(id);
                this.sendSuccess(res, { request }, messages_1.COLLABORATION_MESSAGES.REQUEST_REJECTED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getRequestForUserController = async (req, res, next) => {
            try {
                const { id } = req.params;
                const userRequest = await this._collabService.getRequestForUser(id);
                if (userRequest.length === 0) {
                    this.sendSuccess(res, { requests: [] }, messages_1.COLLABORATION_MESSAGES.NO_REQUESTS_FOUND);
                    logger_1.default.info(`No mentor requests found for userId: ${id}`);
                    return;
                }
                this.sendSuccess(res, { requests: userRequest }, messages_1.COLLABORATION_MESSAGES.REQUEST_RETRIEVED);
            }
            catch (error) {
                next(error);
            }
        };
        this.makeStripePaymentController = async (req, res, next) => {
            try {
                const { paymentMethodId, amount, requestId, email, returnUrl } = req.body;
                if (!returnUrl) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.RETURN_URL_REQUIRED, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const mentorRequestData = await mentor_requset_model_1.default.findById(requestId);
                if (!mentorRequestData) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.MENTOR_REQUEST_NOT_FOUND, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const paymentResult = await this._collabService.processPaymentService(paymentMethodId, amount, requestId, mentorRequestData, email, returnUrl);
                const paymentIntent = "paymentIntent" in paymentResult ? paymentResult.paymentIntent : paymentResult;
                if (paymentIntent.status === "requires_action" && paymentIntent.next_action) {
                    this.sendSuccess(res, { status: "requires_action", charge: paymentIntent }, messages_1.COLLABORATION_MESSAGES.PAYMENT_REQUIRES_ACTION);
                }
                else if (paymentIntent.status === "succeeded") {
                    this.sendSuccess(res, { status: "success", charge: paymentIntent, contacts: paymentResult.contacts }, messages_1.COLLABORATION_MESSAGES.PAYMENT_SUCCEEDED);
                }
                else {
                    this.sendSuccess(res, { status: paymentIntent.status, charge: paymentIntent }, `${messages_1.COLLABORATION_MESSAGES.PAYMENT_STATUS}${paymentIntent.status}`);
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getCollabDataForUserController = async (req, res, next) => {
            try {
                const { id } = req.params;
                const { includeCompleted } = req.body;
                const collabData = await this._collabService.getCollabDataForUserService(id, includeCompleted);
                if (collabData.length === 0) {
                    this.sendSuccess(res, { collabData: [] }, messages_1.COLLABORATION_MESSAGES.NO_COLLABORATIONS_FOUND);
                    logger_1.default.info(`No collaborations found for userId: ${id}`);
                    return;
                }
                this.sendSuccess(res, { collabData }, messages_1.COLLABORATION_MESSAGES.COLLABORATION_DATA_RETRIEVED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getCollabDataForMentorController = async (req, res, next) => {
            try {
                const { id } = req.params;
                const { includeCompleted } = req.body;
                const collabData = await this._collabService.getCollabDataForMentorService(id, includeCompleted);
                if (collabData.length === 0) {
                    this.sendSuccess(res, { collabData: [] }, messages_1.COLLABORATION_MESSAGES.NO_COLLABORATIONS_FOUND);
                    logger_1.default.info(`No collaborations found for mentorId: ${id}`);
                    return;
                }
                this.sendSuccess(res, { collabData }, messages_1.COLLABORATION_MESSAGES.COLLABORATION_DATA_RETRIEVED);
            }
            catch (error) {
                next(error);
            }
        };
        this.cancelAndRefundCollab = async (req, res, next) => {
            try {
                const { collabId } = req.params;
                const { reason, amount } = req.body;
                logger_1.default.info("Processing cancellation and refund with data:", { collabId, reason, amount });
                if (!reason || !amount) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REASON_AND_AMOUNT_REQUIRED, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const updatedCollab = await this._collabService.cancelAndRefundCollab(collabId, reason, amount);
                this.sendSuccess(res, updatedCollab, messages_1.COLLABORATION_MESSAGES.COLLABORATION_CANCELLED_WITH_REFUND);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllMentorRequests = async (req, res, next) => {
            try {
                const { page = "1", limit = "10", search = "" } = req.query;
                const parsedPage = parseInt(page, 10);
                const parsedLimit = parseInt(limit, 10);
                if (isNaN(parsedPage) || parsedPage < 1) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.INVALID_PAGE_NUMBER, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (isNaN(parsedLimit) || parsedLimit < 1) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.INVALID_LIMIT_VALUE, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                logger_1.default.debug(`Fetching all mentor requests with page: ${parsedPage}, limit: ${parsedLimit}, search: ${search}`);
                const mentorRequests = await this._collabService.getMentorRequestsService({
                    page: parsedPage,
                    limit: parsedLimit,
                    search: search,
                });
                if (mentorRequests.requests.length === 0) {
                    this.sendSuccess(res, { requests: [], total: 0, page: parsedPage, pages: 1 }, messages_1.COLLABORATION_MESSAGES.NO_MENTOR_REQUESTS_FOUND);
                    logger_1.default.info(`No mentor requests found for search: ${search}`);
                    return;
                }
                this.sendSuccess(res, mentorRequests, messages_1.COLLABORATION_MESSAGES.MENTOR_REQUESTS_RETRIEVED);
            }
            catch (error) {
                logger_1.default.error(`Error fetching all mentor requests: ${error.message}`);
                next(error);
            }
        };
        this.getAllCollabs = async (req, res, next) => {
            try {
                const { page = "1", limit = "10", search = "" } = req.query;
                const parsedPage = parseInt(page, 10);
                const parsedLimit = parseInt(limit, 10);
                if (isNaN(parsedPage) || parsedPage < 1) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.INVALID_PAGE_NUMBER, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (isNaN(parsedLimit) || parsedLimit < 1) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.INVALID_LIMIT_VALUE, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                logger_1.default.debug(`Fetching all collaborations with page: ${parsedPage}, limit: ${parsedLimit}, search: ${search}`);
                const collaborations = await this._collabService.getCollabsService({
                    page: parsedPage,
                    limit: parsedLimit,
                    search: search,
                });
                if (collaborations.collabs.length === 0) {
                    this.sendSuccess(res, { collabs: [], total: 0, page: parsedPage, pages: 1 }, messages_1.COLLABORATION_MESSAGES.NO_COLLABORATIONS_FOUND);
                    logger_1.default.info(`No collaborations found for search: ${search}`);
                    return;
                }
                this.sendSuccess(res, collaborations, messages_1.COLLABORATION_MESSAGES.COLLABORATION_DATA_RETRIEVED);
            }
            catch (error) {
                logger_1.default.error(`Error fetching all collaborations: ${error.message}`);
                next(error);
            }
        };
        this.getCollabDetailsByCollabId = async (req, res, next) => {
            const { collabId } = req.params;
            try {
                logger_1.default.debug(`Fetching collaboration details for collabId: ${collabId}`);
                const collabDetails = await this._collabService.fetchCollabById(collabId);
                if (!collabDetails) {
                    this.sendSuccess(res, { collabData: null }, messages_1.COLLABORATION_MESSAGES.NO_COLLABORATION_FOUND);
                    logger_1.default.info(`No collaboration found for collabId: ${collabId}`);
                    return;
                }
                this.sendSuccess(res, collabDetails, messages_1.COLLABORATION_MESSAGES.COLLABORATION_DETAILS_ACCESSED);
            }
            catch (error) {
                logger_1.default.error(`Error fetching collaboration details for collabId ${collabId || "unknown"}: ${error.message}`);
                next(error);
            }
        };
        this.getRequestDetailsByRequestId = async (req, res, next) => {
            const { requestId } = req.params;
            try {
                logger_1.default.debug(`Fetching request details for requestId: ${requestId}`);
                const requestDetails = await this._collabService.fetchRequestById(requestId);
                if (!requestDetails) {
                    this.sendSuccess(res, { requests: null }, messages_1.COLLABORATION_MESSAGES.NO_REQUEST_FOUND);
                    logger_1.default.info(`No mentor request found for requestId: ${requestId}`);
                    return;
                }
                this.sendSuccess(res, requestDetails, messages_1.COLLABORATION_MESSAGES.REQUEST_DETAILS_ACCESSED);
            }
            catch (error) {
                logger_1.default.error(`Error fetching request details for requestId ${requestId || "unknown"}: ${error.message}`);
                next(error);
            }
        };
        this.markUnavailableDays = async (req, res, next) => {
            try {
                const { collabId } = req.params;
                const { datesAndReasons, requestedBy, requesterId, approvedById, isApproved } = req.body;
                const updatedCollaboration = await this._collabService.markUnavailableDaysService(collabId, {
                    datesAndReasons,
                    requestedBy,
                    requesterId,
                    approvedById,
                    isApproved,
                });
                this.sendSuccess(res, updatedCollaboration, messages_1.COLLABORATION_MESSAGES.UNAVAILABLE_DAYS_UPDATED);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateTemporarySlotChanges = async (req, res, next) => {
            try {
                const { collabId } = req.params;
                const { datesAndNewSlots, requestedBy, requesterId, approvedById, isApproved } = req.body;
                const updatedCollaboration = await this._collabService.updateTemporarySlotChangesService(collabId, {
                    datesAndNewSlots,
                    requestedBy,
                    requesterId,
                    approvedById,
                    isApproved,
                });
                this.sendSuccess(res, updatedCollaboration, messages_1.COLLABORATION_MESSAGES.TEMPORARY_SLOT_CHANGES_UPDATED);
            }
            catch (error) {
                next(error);
            }
        };
        this.approveTimeSlotRequest = async (req, res, next) => {
            try {
                const { collabId } = req.params;
                const { requestId, isApproved, requestType } = req.body;
                const updatedCollaboration = await this._collabService.processTimeSlotRequest(collabId, requestId, isApproved, requestType);
                this.sendSuccess(res, updatedCollaboration, messages_1.COLLABORATION_MESSAGES.TIME_SLOT_REQUEST_PROCESSED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMentorLockedSlotsController = async (req, res, next) => {
            const { mentorId } = req.params;
            try {
                if (!mentorId) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.MENTOR_ID_REQUIRED, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                logger_1.default.debug(`Fetching locked slots for mentorId: ${mentorId}`);
                const lockedSlots = await this._collabService.getMentorLockedSlots(mentorId);
                if (lockedSlots.length === 0) {
                    this.sendSuccess(res, { lockedSlots: [] }, messages_1.COLLABORATION_MESSAGES.NO_LOCKED_SLOTS_FOUND);
                    logger_1.default.info(`No locked slots found for mentorId: ${mentorId}`);
                    return;
                }
                this.sendSuccess(res, { lockedSlots }, messages_1.COLLABORATION_MESSAGES.LOCKED_SLOTS_RETRIEVED);
            }
            catch (error) {
                logger_1.default.error(`Error fetching locked slots for mentorId ${mentorId || "unknown"}: ${error.message}`);
                next(error);
            }
        };
        this.downloadReceiptController = async (req, res, next) => {
            const { collabId } = req.params;
            try {
                logger_1.default.debug(`Request to download receipt for collabId: ${collabId}`);
                const pdfBuffer = await this._collabService.generateReceiptPDF(collabId);
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", `attachment; filename=receipt-${collabId}.pdf`);
                res.send(pdfBuffer);
            }
            catch (error) {
                logger_1.default.error(`Error generating receipt for collabId ${collabId}: ${error.message}`);
                next(error);
            }
        };
        this.deleteMentorRequestController = async (req, res, next) => {
            try {
                const { id } = req.params;
                await this._collabService.deleteMentorRequestService(id);
                this.sendSuccess(res, null, "Mentor request deleted successfully");
            }
            catch (error) {
                next(error);
            }
        };
        this._collabService = collaborationService;
    }
};
exports.CollaborationController = CollaborationController;
exports.CollaborationController = CollaborationController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('ICollaborationService')),
    __metadata("design:paramtypes", [Object])
], CollaborationController);
//# sourceMappingURL=collaboration-controller.js.map