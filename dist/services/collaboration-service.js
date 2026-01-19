"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.CollaborationService = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = __importStar(require("mongoose"));
const uuid_1 = require("uuid");
const pdfkit_1 = __importDefault(require("pdfkit"));
const status_code_enums_1 = require("../enums/status-code-enums");
const error_handler_1 = require("../core/utils/error-handler");
const email_1 = require("../core/utils/email");
const stripe_1 = __importDefault(require("../core/utils/stripe"));
const logger_1 = __importDefault(require("../core/utils/logger"));
const mentor_request_mapper_1 = require("../Utils/mappers/mentor-request-mapper");
const collaboration_mapper_1 = require("../Utils/mappers/collaboration-mapper");
let CollaborationService = class CollaborationService {
    constructor(collaboartionRepository, contactRepository, mentorRepository, userRepository, notificationService) {
        this.TemporaryRequestService = async (requestData) => {
            try {
                logger_1.default.debug(`Creating temporary request`);
                const request = await this._collabRepository.createTemporaryRequest({
                    ...requestData,
                    paymentStatus: "Pending",
                    isAccepted: "Pending",
                });
                logger_1.default.info(`Temporary request created: ${request._id}`);
                return (0, mentor_request_mapper_1.toMentorRequestDTO)(request);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating temporary request: ${err.message}`);
                throw new error_handler_1.ServiceError("Failed to create temporary request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getMentorRequests = async (mentorId) => {
            try {
                logger_1.default.debug(`Fetching mentor requests for mentor: ${mentorId}`);
                if (!mongoose_1.Types.ObjectId.isValid(mentorId)) {
                    throw new error_handler_1.ServiceError("Invalid mentor ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const requests = await this._collabRepository.getMentorRequestsByMentorId(mentorId);
                logger_1.default.info(`Fetched ${requests.length} mentor requests for mentorId: ${mentorId}`);
                return (0, mentor_request_mapper_1.toMentorRequestDTOs)(requests);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching mentor requests for mentor ${mentorId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch mentor requests", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.acceptRequest = async (requestId) => {
            try {
                logger_1.default.debug(`Accepting mentor request: ${requestId}`);
                if (!mongoose_1.Types.ObjectId.isValid(requestId)) {
                    throw new error_handler_1.ServiceError("Invalid request ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                //Load the request first
                const existingRequest = await this._collabRepository.findMentorRequestById(requestId);
                if (!existingRequest) {
                    throw new error_handler_1.ServiceError("Mentor request not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                if (!existingRequest.selectedSlot || !existingRequest.selectedSlot.day || !existingRequest.selectedSlot.timeSlots) {
                    throw new error_handler_1.ServiceError("Selected time slot not found for this request", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const slotDay = existingRequest.selectedSlot.day;
                const rawTime = existingRequest.selectedSlot.timeSlots;
                const slotTime = Array.isArray(rawTime) ? rawTime[0] : rawTime;
                const mentorIdStr = existingRequest.mentorId.toString();
                const userIdStr = existingRequest.userId.toString();
                //Check mentor schedule (collabs + accepted requests)
                const mentorHasConflict = await this.hasMentorSlotConflict(mentorIdStr, slotDay, slotTime);
                if (mentorHasConflict) {
                    throw new error_handler_1.ServiceError("Mentor already has a session at this time slot", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                //Check user schedule (confirmed collaborations)
                const userHasConflict = await this.hasUserCollabSlotConflict(userIdStr, slotDay, slotTime);
                if (userHasConflict) {
                    throw new error_handler_1.ServiceError("User already has a confirmed session at this time slot", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const updatedRequest = await this._collabRepository.updateMentorRequestStatus(requestId, "Accepted");
                if (!updatedRequest) {
                    throw new error_handler_1.ServiceError("Updating status of request failed", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                const user = await this._userRepository.findById(updatedRequest.userId.toString());
                const mentor = await this._mentorRepository.getMentorById(updatedRequest.mentorId.toString());
                if (!user || !mentor || !mentor.userId) {
                    throw new error_handler_1.ServiceError("User or mentor details not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const mentorUser = mentor.userId;
                const userEmail = user.email;
                const userName = user.name;
                const mentorEmail = mentorUser.email;
                const mentorName = mentorUser.name;
                if (!userEmail || !mentorEmail) {
                    throw new error_handler_1.ServiceError("User or mentor email not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const userSubject = "Mentor Request Acceptance Notice";
                const userText = `Dear ${userName},\n\nYour mentor request to ${mentorName} has been accepted. Please proceed with the payment to start the collaboration.\n\nBest regards,\nConnectSphere Team`;
                await (0, email_1.sendEmail)(userEmail, userSubject, userText);
                logger_1.default.info(`Acceptance email sent to user: ${userEmail}`);
                const mentorSubject = "Mentor Request Acceptance Notice";
                const mentorText = `Dear ${mentorName},\n\nYou have accepted the mentor request from ${userName}. Awaiting payment to start the collaboration.\n\nBest regards,\nConnectSphere Team`;
                await (0, email_1.sendEmail)(mentorEmail, mentorSubject, mentorText);
                logger_1.default.info(`Acceptance email sent to mentor: ${mentorEmail}`);
                await this._notificationService.sendNotification(user._id.toString(), "collaboration_status", mentorUser._id.toString(), requestId, "collaboration", undefined, undefined, `Your mentor request has been accepted by ${mentorUser.name}. Waiting for payment.`);
                logger_1.default.info(`Sent collaboration_status notification to user ${user._id}`);
                await this._notificationService.sendNotification(mentorUser._id.toString(), "collaboration_status", user._id.toString(), requestId, "collaboration", undefined, undefined, `You have accepted the mentor request from ${user.name}.`);
                logger_1.default.info(`Sent collaboration_status notification to mentor ${mentorUser._id}`);
                return (0, mentor_request_mapper_1.toMentorRequestDTO)(updatedRequest);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error accepting request ${requestId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to accept mentor request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.rejectRequest = async (requestId) => {
            try {
                logger_1.default.debug(`Rejecting mentor request: ${requestId}`);
                if (!mongoose_1.Types.ObjectId.isValid(requestId)) {
                    throw new error_handler_1.ServiceError("Invalid request ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const updatedRequest = await this._collabRepository.updateMentorRequestStatus(requestId, "Rejected");
                if (!updatedRequest) {
                    throw new error_handler_1.ServiceError("Updating status of request failed", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                const user = await this._userRepository.findById(updatedRequest.userId.toString());
                const mentor = await this._mentorRepository.getMentorById(updatedRequest.mentorId.toString());
                if (!user || !mentor || !mentor.userId) {
                    throw new error_handler_1.ServiceError("User or mentor details not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const mentorUser = mentor.userId;
                const userEmail = user.email;
                const userName = user.name;
                const mentorEmail = mentorUser.email;
                const mentorName = mentorUser.name;
                if (!userEmail || !mentorEmail) {
                    throw new error_handler_1.ServiceError("User or mentor email not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const userSubject = "Mentor Request Rejection Notice";
                const userText = `Dear ${userName},\n\nYour mentor request to ${mentorName} has been rejected.\nPlease contact support for more details.\n\nBest regards,\nConnectSphere Team`;
                await (0, email_1.sendEmail)(userEmail, userSubject, userText);
                logger_1.default.info(`Rejection email sent to user: ${userEmail}`);
                const mentorSubject = "Mentor Request Rejection Notice";
                const mentorText = `Dear ${mentorName},\n\nYou have rejected the mentor request from ${userName}.\nPlease contact support for more details.\n\nBest regards,\nConnectSphere Team`;
                await (0, email_1.sendEmail)(mentorEmail, mentorSubject, mentorText);
                logger_1.default.info(`Rejection email sent to mentor: ${mentorEmail}`);
                await this._notificationService.sendNotification(user._id.toString(), "collaboration_status", mentorUser._id.toString(), requestId, "collaboration", undefined, undefined, `Your mentor request to ${mentorUser.name} has been rejected. Check your email for more details.`);
                logger_1.default.info(`Sent collaboration_status notification to user ${user._id}`);
                await this._notificationService.sendNotification(mentorUser._id.toString(), "collaboration_status", user._id.toString(), requestId, "collaboration", undefined, undefined, `You have rejected the mentor request from ${user.name}. Check your email for more details.`);
                logger_1.default.info(`Sent collaboration_status notification to mentor ${mentorUser._id}`);
                return (0, mentor_request_mapper_1.toMentorRequestDTO)(updatedRequest);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error rejecting request ${requestId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to reject mentor request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getRequestForUser = async (userId) => {
            try {
                logger_1.default.debug(`Fetching requests for user: ${userId}`);
                if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                    throw new error_handler_1.ServiceError("Invalid user ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const requests = await this._collabRepository.getRequestByUserId(userId);
                logger_1.default.info(`Fetched ${requests.length} mentor requests for userId: ${userId}`);
                return (0, mentor_request_mapper_1.toMentorRequestDTOs)(requests);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching requests for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch user requests", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.processPaymentService = async (paymentMethodId, amount, requestId, mentorRequestData, email, returnUrl) => {
            try {
                logger_1.default.debug(`Processing payment for request: ${requestId}`);
                if (!mentorRequestData.mentorId || !mentorRequestData.userId) {
                    throw new error_handler_1.ServiceError("Mentor ID and User ID are required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                //Fetch mentor & user
                const mentor = await this._mentorRepository.getMentorById(mentorRequestData.mentorId.toString());
                if (!mentor || !mentor.userId) {
                    throw new error_handler_1.ServiceError("Mentor or mentor’s userId not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const mentorUser = mentor.userId;
                const user = await this._userRepository.findById(mentorRequestData.userId.toString());
                if (!user) {
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const idempotencyKey = (0, uuid_1.v4)();
                let customers = await stripe_1.default.customers.list({ email, limit: 1 });
                let customer = customers.data.length > 0 ? customers.data[0] : null;
                if (!customer) {
                    customer = await stripe_1.default.customers.create({
                        email,
                        payment_method: paymentMethodId,
                        invoice_settings: { default_payment_method: paymentMethodId },
                    });
                }
                const paymentIntent = await stripe_1.default.paymentIntents.create({
                    amount,
                    currency: "inr",
                    customer: customer.id,
                    payment_method: paymentMethodId,
                    confirm: true,
                    receipt_email: email,
                    description: `Payment for Request ID: ${requestId}`,
                    metadata: { requestId },
                    return_url: `${returnUrl}?payment_status=success&request_id=${requestId}`,
                }, { idempotencyKey });
                // If payment not successful → no DB changes
                if (paymentIntent.status !== "succeeded") {
                    return { paymentIntent };
                }
                // ---------- MONGODB TRANSACTION START ----------
                const session = await mongoose_1.default.startSession();
                let createdContacts;
                try {
                    await session.withTransaction(async () => {
                        const startDate = new Date();
                        const endDate = new Date(startDate);
                        const totalSessions = mentorRequestData.timePeriod || 1;
                        const sessionDay = mentorRequestData.selectedSlot?.day;
                        if (!sessionDay) {
                            throw new error_handler_1.ServiceError("Selected slot day is required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                        }
                        // Calculate endDate based on day & number of sessions
                        let sessionCount = 0;
                        while (sessionCount < totalSessions) {
                            endDate.setDate(endDate.getDate() + 1);
                            if (endDate.toLocaleDateString("en-US", { weekday: "long" }) ===
                                sessionDay) {
                                sessionCount++;
                            }
                        }
                        // Create collaboration inside transaction
                        const collaboration = await this._collabRepository.createCollaboration({
                            mentorId: mentorRequestData.mentorId,
                            userId: mentorRequestData.userId,
                            selectedSlot: mentorRequestData.selectedSlot
                                ? [mentorRequestData.selectedSlot]
                                : [],
                            price: amount / 100,
                            payment: true,
                            isCancelled: false,
                            startDate,
                            endDate,
                            paymentIntentId: paymentIntent.id,
                        }, session);
                        const collaborationDTO = (0, collaboration_mapper_1.toCollaborationDTO)(collaboration);
                        if (!collaborationDTO) {
                            logger_1.default.error(`Failed to map collaboration ${collaboration._id} to DTO`);
                            throw new error_handler_1.ServiceError("Failed to map collaboration to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                        }
                        logger_1.default.info(`Collaboration created: ${collaboration._id}`);
                        // Create contacts inside transaction
                        const [contact1, contact2] = await Promise.all([
                            this._contactRepository.createContact({
                                userId: mentorRequestData.userId ? mentorRequestData.userId.toString() : undefined,
                                targetUserId: mentorUser._id.toString(),
                                collaborationId: collaboration._id,
                                type: "user-mentor",
                            }, session),
                            this._contactRepository.createContact({
                                userId: mentorUser._id.toString(),
                                targetUserId: mentorRequestData.userId ? mentorRequestData.userId.toString() : undefined,
                                collaborationId: collaboration._id,
                                type: "user-mentor",
                            }, session),
                        ]);
                        createdContacts = [contact1, contact2];
                        // Delete mentor request inside transaction
                        await this._collabRepository.deleteMentorRequest(requestId, session);
                    });
                    // ---------- TRANSACTION COMMITTED SUCCESSFULLY ----------
                    // Notifications & emails
                    await this._notificationService.sendNotification(user._id.toString(), "collaboration_status", mentorUser._id.toString(), requestId, "collaboration", undefined, undefined, `Payment completed and collaboration created with ${mentorUser.name}!`);
                    await this._notificationService.sendNotification(mentorUser._id.toString(), "collaboration_status", user._id.toString(), requestId, "collaboration", undefined, undefined, `${user.name}’s payment completed and collaboration created!`);
                    return { paymentIntent, contacts: createdContacts };
                }
                finally {
                    session.endSession();
                }
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error processing payment for request ${requestId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to process payment", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        //Check whether the collbaoration is completed
        this.checkAndCompleteCollaboration = async (collab) => {
            try {
                const currentDate = new Date();
                if (!collab.isCancelled &&
                    (collab.feedbackGiven ||
                        (collab.endDate && collab.endDate <= currentDate))) {
                    logger_1.default.debug(`Marking collaboration ${collab._id} as complete`);
                    const updatedCollab = await this._collabRepository.findByIdAndUpdateWithPopulate(collab._id.toString(), { isCompleted: true }, { new: true });
                    const updatedCollabDTO = (0, collaboration_mapper_1.toCollaborationDTO)(updatedCollab);
                    if (!updatedCollabDTO) {
                        logger_1.default.error(`Failed to map collaboration ${collab._id} to DTO`);
                        throw new error_handler_1.ServiceError("Failed to map collaboration to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                    }
                    await this._contactRepository.deleteContact(collab._id.toString(), "user-mentor");
                    logger_1.default.info(`Collaboration ${collab._id} was completed, so associated contact was deleted`);
                    return updatedCollabDTO;
                }
                const collabDTO = (0, collaboration_mapper_1.toCollaborationDTO)(collab);
                if (!collabDTO) {
                    logger_1.default.error(`Failed to map collaboration ${collab._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map collaboration to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                return collabDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error checking collaboration ${collab._id}: ${err.message}`);
                throw new error_handler_1.ServiceError("Failed to check and complete collaboration", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getCollabDataForUserService = async (userId, includeCompleted = true) => {
            try {
                logger_1.default.debug(`Fetching collaboration data for user: ${userId}`);
                if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                    throw new error_handler_1.ServiceError("Invalid user ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const collaborations = await this._collabRepository.getCollabDataForUser(userId);
                const updatedCollaborations = await Promise.all(collaborations.map(async (collab) => {
                    return await this.checkAndCompleteCollaboration(collab);
                }));
                const finalCollaborations = includeCompleted
                    ? updatedCollaborations.filter((c) => c !== null)
                    : updatedCollaborations.filter((c) => c !== null && !c.isCompleted);
                logger_1.default.info(`Fetched ${finalCollaborations.length} ${includeCompleted ? "total" : "active"} collaborations for userId: ${userId}`);
                return finalCollaborations;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching collaborations for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch user collaborations", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getCollabDataForMentorService = async (mentorId, includeCompleted = true) => {
            try {
                logger_1.default.debug(`Fetching collaboration data for mentor: ${mentorId}`);
                if (!mongoose_1.Types.ObjectId.isValid(mentorId)) {
                    throw new error_handler_1.ServiceError("Invalid mentor ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const collaborations = await this._collabRepository.getCollabDataForMentor(mentorId);
                const updatedCollaborations = await Promise.all(collaborations.map(async (collab) => {
                    return await this.checkAndCompleteCollaboration(collab);
                }));
                const finalCollaborations = includeCompleted
                    ? updatedCollaborations.filter((c) => c !== null)
                    : updatedCollaborations.filter((c) => c !== null && !c.isCompleted);
                logger_1.default.info(`Fetched ${finalCollaborations.length} ${includeCompleted ? "total" : "active"} collaborations for userId: ${mentorId}`);
                return finalCollaborations;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching collaborations for mentor ${mentorId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch mentor collaborations", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.cancelAndRefundCollab = async (collabId, reason, amount) => {
            try {
                logger_1.default.debug(`Processing cancellation and refund for collaboration: ${collabId}`);
                if (!mongoose_1.Types.ObjectId.isValid(collabId)) {
                    throw new error_handler_1.ServiceError("Invalid collaboration ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const collab = await this._collabRepository.findCollabById(collabId);
                if (!collab) {
                    throw new error_handler_1.ServiceError("Collaboration not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                if (!collab.payment) {
                    throw new error_handler_1.ServiceError("No payment found for this collaboration", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (collab.isCancelled) {
                    throw new error_handler_1.ServiceError("Collaboration is already cancelled", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (collab.paymentIntentId) {
                    const refundAmount = Math.round(amount * 100);
                    const refund = await stripe_1.default.refunds.create({
                        payment_intent: collab.paymentIntentId,
                        amount: refundAmount,
                        reason: "requested_by_customer",
                        metadata: { collabId, reason },
                    });
                    logger_1.default.info(`Refund processed for collaboration ${collabId}: ${refund.id}, amount: ${refundAmount / 100} INR`);
                }
                else {
                    logger_1.default.warn(`No paymentIntentId for collaboration ${collabId}. Skipping refund and notifying support.`);
                }
                const updatedCollab = await this._collabRepository.markCollabAsCancelled(collabId);
                const updatedCollabDTO = (0, collaboration_mapper_1.toCollaborationDTO)(updatedCollab);
                if (!updatedCollabDTO) {
                    logger_1.default.error(`Failed to map collaboration ${updatedCollab?._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map collaboration to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                await this._contactRepository.deleteContact(collabId, "user-mentor");
                const user = collab.userId;
                const mentor = collab.mentorId.userId;
                logger_1.default.info(`[cancel and Refund] user deatils : ${user}`);
                logger_1.default.info(`[cancel and Refund] mentor Details : ${mentor}`);
                if (!user.email || !mentor.email) {
                    throw new error_handler_1.ServiceError("User or mentor email not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                //Give notification here also
                await this._notificationService.sendNotification(user._id.toString(), "collaboration_status", mentor._id.toString(), collabId, "collaboration", undefined, undefined, `Your collaboration with ${mentor.name} cancelled.`);
                logger_1.default.info(`Sent collaboration_status 'cancelled' notification to user ${user._id}`);
                await this._notificationService.sendNotification(mentor._id.toString(), "collaboration_status", user._id.toString(), collabId, "collaboration", undefined, undefined, `You collaboration with ${user.name} cancelled`);
                logger_1.default.info(`Sent collaboration_status 'cancelled' to mentor ${mentor._id}`);
                const userSubject = "Mentorship Cancellation and Refund Notice";
                const userText = collab.paymentIntentId
                    ? `Dear ${user.name},\n\nYour mentorship session with ${mentor.name} has been cancelled, and a 50% refund of Rs. ${amount.toFixed(2)} has been processed.\nReason: ${reason}\n\nIf you have any questions, please contact support.\n\nBest regards,\nConnectSphere Team`
                    : `Dear ${user.name},\n\nYour mentorship session with ${mentor.name} has been cancelled. No refund was processed due to missing payment details. Please contact support for assistance.\nReason: ${reason}\n\nBest regards,\nConnectSphere Team`;
                await (0, email_1.sendEmail)(user.email, userSubject, userText);
                logger_1.default.info(`Cancellation and refund email sent to user: ${user.email}`);
                const mentorSubject = "Mentorship Session Cancellation Notice";
                const mentorText = `Dear ${mentor.name},\n\nWe regret to inform you that your mentorship session with ${user.name} has been cancelled.\nReason: ${reason}\n\nIf you have any questions, please contact support.\n\nBest regards,\nConnectSphere Team`;
                await (0, email_1.sendEmail)(mentor.email, mentorSubject, mentorText);
                logger_1.default.info(`Cancellation email sent to mentor: ${mentor.email}`);
                logger_1.default.info(`Collaboration ${collabId} cancelled${collab.paymentIntentId
                    ? ` with 50% refund of Rs. ${amount.toFixed(2)}`
                    : ""}`);
                return updatedCollabDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error cancelling collaboration ${collabId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to cancel and refund collaboration", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getMentorRequestsService = async ({ page, limit, search, }) => {
            try {
                logger_1.default.debug(`Fetching mentor requests for admin with page: ${page}, limit: ${limit}, search: ${search}`);
                const result = await this._collabRepository.findMentorRequest({
                    page,
                    limit,
                    search,
                });
                logger_1.default.info(`Fetched ${result.requests.length} mentor requests, total: ${result.total}`);
                return {
                    requests: (0, mentor_request_mapper_1.toMentorRequestDTOs)(result.requests),
                    total: result.total,
                    page: result.page,
                    pages: result.pages,
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching mentor requests: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch mentor requests", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getCollabsService = async ({ page, limit, search, }) => {
            try {
                logger_1.default.debug(`Fetching collaborations for admin with page: ${page}, limit: ${limit}, search: ${search}`);
                const { collabs, total, page: currentPage, pages, } = await this._collabRepository.findCollab({
                    page,
                    limit,
                    search,
                });
                const updatedCollabs = await Promise.all(collabs.map(async (collab) => {
                    return await this.checkAndCompleteCollaboration(collab);
                }));
                const filteredCollabs = updatedCollabs.filter((collab) => collab !== null);
                logger_1.default.info(`Fetched ${filteredCollabs.length} collaborations, total: ${total}`);
                return { collabs: filteredCollabs, total, page: currentPage, pages };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching collaborations: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch collaborations", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.fetchCollabById = async (collabId) => {
            try {
                logger_1.default.debug(`Fetching collaboration by ID: ${collabId}`);
                if (!mongoose_1.Types.ObjectId.isValid(collabId)) {
                    throw new error_handler_1.ServiceError("Invalid collaboration ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const collab = await this._collabRepository.findCollabById(collabId);
                const collabDTO = (0, collaboration_mapper_1.toCollaborationDTO)(collab);
                if (!collabDTO && collab) {
                    logger_1.default.error(`Failed to map collaboration ${collab._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map collaboration to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Collaboration ${collab ? "found" : "not found"} for collabId: ${collabId}`);
                return collabDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching collaboration ${collabId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch collaboration", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.fetchRequestById = async (requestId) => {
            try {
                logger_1.default.debug(`Fetching request by ID: ${requestId}`);
                if (!mongoose_1.Types.ObjectId.isValid(requestId)) {
                    throw new error_handler_1.ServiceError("Invalid request ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const request = await this._collabRepository.fetchMentorRequestDetails(requestId);
                const requestDTO = (0, mentor_request_mapper_1.toMentorRequestDTO)(request);
                if (!requestDTO && request) {
                    logger_1.default.error(`Failed to map mentor request ${request._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map mentor request to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Mentor request ${request ? "found" : "not found"} for requestId: ${requestId}`);
                return requestDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching request ${requestId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch mentor request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.markUnavailableDaysService = async (collabId, updateData) => {
            try {
                logger_1.default.debug(`Marking unavailable days for collaboration: ${collabId}`);
                if (!mongoose_1.Types.ObjectId.isValid(collabId)) {
                    throw new error_handler_1.ServiceError("Invalid collaboration ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const collaboration = await this._collabRepository.updateUnavailableDays(collabId, updateData);
                const collaborationDTO = (0, collaboration_mapper_1.toCollaborationDTO)(collaboration);
                if (!collaborationDTO && collaboration) {
                    logger_1.default.error(`Failed to map collaboration ${collaboration._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map collaboration to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Updated unavailable days for collaboration ${collabId}`);
                return collaborationDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error marking unavailable days for collaboration ${collabId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to mark unavailable days", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateTemporarySlotChangesService = async (collabId, updateData) => {
            try {
                logger_1.default.debug(`Updating temporary slot changes for collaboration: ${collabId}`);
                if (!mongoose_1.Types.ObjectId.isValid(collabId)) {
                    throw new error_handler_1.ServiceError("Invalid collaboration ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const collaboration = await this._collabRepository.updateTemporarySlotChanges(collabId, updateData);
                const collaborationDTO = (0, collaboration_mapper_1.toCollaborationDTO)(collaboration);
                if (!collaborationDTO && collaboration) {
                    logger_1.default.error(`Failed to map collaboration ${collaboration._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map collaboration to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Updated temporary slot changes for collaboration ${collabId}`);
                return collaborationDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating temporary slot changes for collaboration ${collabId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to update temporary slot changes", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.processTimeSlotRequest = async (collabId, requestId, isApproved, requestType) => {
            try {
                logger_1.default.debug(`Processing time slot request for collaboration: ${collabId}`);
                if (!mongoose_1.Types.ObjectId.isValid(collabId) ||
                    !mongoose_1.Types.ObjectId.isValid(requestId)) {
                    throw new error_handler_1.ServiceError("Invalid collaboration ID or request ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const collaboration = await this._collabRepository.findCollabById(collabId);
                if (!collaboration) {
                    throw new error_handler_1.ServiceError("Collaboration not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                let requestedBy;
                if (requestType === "unavailable") {
                    const request = collaboration.unavailableDays.find((req) => req._id.toString() === requestId);
                    if (!request) {
                        throw new error_handler_1.ServiceError("Unavailable days request not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                    }
                    requestedBy = request.requestedBy;
                }
                else {
                    const request = collaboration.temporarySlotChanges.find((req) => req._id.toString() === requestId);
                    if (!request) {
                        throw new error_handler_1.ServiceError("Time slot change request not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                    }
                    requestedBy = request.requestedBy;
                }
                if (!requestedBy) {
                    throw new error_handler_1.ServiceError("Unable to determine who requested the change", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                let newEndDate;
                if (requestType === "unavailable" && isApproved) {
                    const request = collaboration.unavailableDays.find((req) => req._id.toString() === requestId);
                    if (request) {
                        const unavailableDates = request.datesAndReasons.map((item) => new Date(item.date));
                        const selectedDay = collaboration.selectedSlot[0]?.day;
                        if (!selectedDay) {
                            throw new error_handler_1.ServiceError("Selected slot day not found", status_code_enums_1.StatusCodes.BAD_REQUEST);
                        }
                        const currentEndDate = collaboration.endDate || collaboration.startDate;
                        newEndDate = this.calculateNewEndDate(currentEndDate, unavailableDates, selectedDay);
                    }
                }
                const status = isApproved ? "approved" : "rejected";
                const updatedCollaboration = await this._collabRepository.updateRequestStatus(collabId, requestId, requestType, status, newEndDate);
                const updatedCollaborationDTO = (0, collaboration_mapper_1.toCollaborationDTO)(updatedCollaboration);
                if (!updatedCollaborationDTO && updatedCollaboration) {
                    logger_1.default.error(`Failed to map collaboration ${updatedCollaboration._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map collaboration to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                if (status === "rejected") {
                    const user = collaboration.userId;
                    const mentor = collaboration.mentorId.userId;
                    if (!user.email || !mentor.email) {
                        throw new error_handler_1.ServiceError("User or mentor email not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                    }
                    const recipientEmail = requestedBy === "user" ? mentor.email : user.email;
                    const recipientName = requestedBy === "user" ? mentor.name : user.name;
                    const otherPartyName = requestedBy === "user" ? user.name : mentor.name;
                    const subject = "Request Rejection Notice";
                    const text = `Dear ${recipientName},\n\nWe regret to inform you that the request for ${requestType === "unavailable"
                        ? "unavailable days"
                        : "a time slot change"} in your mentorship session with ${otherPartyName} has been rejected.\n\nIf you have any questions, please contact support.\n\nBest regards,\nConnectSphere Team`;
                    await (0, email_1.sendEmail)(recipientEmail, subject, text);
                    logger_1.default.info(`Rejection email sent to ${requestedBy === "user" ? "mentor" : "user"}: ${recipientEmail}`);
                }
                logger_1.default.info(`Processed time slot request for collaboration ${collabId}: ${status}`);
                return updatedCollaborationDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error processing time slot request for collaboration ${collabId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to process time slot request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getMentorLockedSlots = async (mentorId) => {
            try {
                logger_1.default.debug(`Fetching locked slots for mentor: ${mentorId}`);
                if (!mongoose_1.Types.ObjectId.isValid(mentorId)) {
                    throw new error_handler_1.ServiceError("Invalid mentor ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const lockedSlots = await this._collabRepository.getLockedSlotsByMentorId(mentorId);
                logger_1.default.info(`Fetched ${lockedSlots.length} locked slots for mentorId: ${mentorId}`);
                return lockedSlots;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching locked slots for mentor ${mentorId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch locked slots", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.calculateNewEndDate = (currentEndDate, unavailableDates, selectedDay) => {
            try {
                const dayMap = {
                    Sunday: 0,
                    Monday: 1,
                    Tuesday: 2,
                    Wednesday: 3,
                    Thursday: 4,
                    Friday: 5,
                    Saturday: 6,
                };
                const selectedDayOfWeek = dayMap[selectedDay];
                if (selectedDayOfWeek === undefined) {
                    throw new error_handler_1.ServiceError("Invalid selected day", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const newEndDate = new Date(currentEndDate);
                const daysToAdd = unavailableDates.length;
                let currentDate = new Date(newEndDate);
                let sessionsAdded = 0;
                while (sessionsAdded < daysToAdd) {
                    currentDate.setDate(currentDate.getDate() + 1);
                    if (currentDate.getDay() === selectedDayOfWeek) {
                        sessionsAdded++;
                    }
                }
                return currentDate;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error calculating new end date: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to calculate new end date", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getReceiptData = async (collabId) => {
            try {
                logger_1.default.debug(`Fetching receipt data for collaboration: ${collabId}`);
                if (!mongoose_1.Types.ObjectId.isValid(collabId)) {
                    throw new error_handler_1.ServiceError("Invalid collaboration ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const collab = await this._collabRepository.findCollabById(collabId);
                if (!collab || !collab.paymentIntentId) {
                    throw new error_handler_1.ServiceError("Collaboration or payment not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const collabDTO = (0, collaboration_mapper_1.toCollaborationDTO)(collab);
                logger_1.default.debug("Collaboartion DTO Structure : ", collabDTO);
                if (!collabDTO) {
                    logger_1.default.error(`Failed to map collaboration ${collab._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map collaboration to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                const paymentIntent = await stripe_1.default.paymentIntents.retrieve(collab.paymentIntentId);
                if (!paymentIntent) {
                    throw new error_handler_1.ServiceError("Payment intent not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const mentorId = collab.mentorId._id.toString();
                const mentor = await this._mentorRepository.getMentorById(mentorId);
                if (!mentor || !mentor.userId) {
                    throw new error_handler_1.ServiceError("Mentor or mentor’s userId not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const mentorUser = mentor.userId;
                const userId = collab.userId._id.toString();
                const user = await this._userRepository.findById(userId);
                if (!user) {
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                return { mentorUser, user, paymentIntent, collab: collabDTO };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching receipt data for collaboration ${collabId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch receipt data", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.generateReceiptPDF = async (collabId) => {
            try {
                logger_1.default.debug(`Generating PDF receipt for collaboration: ${collabId}`);
                const { mentorUser, user, paymentIntent, collab } = await this.getReceiptData(collabId);
                return new Promise((resolve, reject) => {
                    const doc = new pdfkit_1.default();
                    const buffers = [];
                    doc.on("data", buffers.push.bind(buffers));
                    doc.on("end", () => {
                        const pdfBuffer = Buffer.concat(buffers);
                        resolve(pdfBuffer);
                    });
                    doc.on("error", (error) => {
                        logger_1.default.error(`Error generating PDF for collabId ${collabId}: ${error.message}`);
                        reject(new error_handler_1.ServiceError("Failed to generate PDF", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, error));
                    });
                    doc.fontSize(20).text("Payment Receipt", { align: "center" });
                    doc
                        .fontSize(14)
                        .text("ConnectSphere Mentorship Platform", { align: "center" });
                    doc.fontSize(10).text(`Issued on: ${new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}`, { align: "center" });
                    doc.moveDown(2);
                    doc.fontSize(12).text("Receipt Details", { underline: true });
                    doc.moveDown(0.5);
                    doc
                        .fontSize(10)
                        .text(`Collaboration ID: ${collab.collaborationId || collab.id}`);
                    doc.text(`Mentor: ${mentorUser.name}`);
                    doc.text(`User: ${user.name}`);
                    doc.text(`Amount: INR ${collab.price.toFixed(2)}`);
                    doc.text(`Payment Date: ${paymentIntent.created
                        ? new Date(paymentIntent.created * 1000).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })
                        : "Unknown"}`);
                    doc.text(`Payment ID: ${paymentIntent.id}`);
                    doc.text(`Status: ${paymentIntent.status.charAt(0).toUpperCase() +
                        paymentIntent.status.slice(1)}`);
                    doc.moveDown(2);
                    doc.fontSize(12).text("Description", { underline: true });
                    doc.moveDown(0.5);
                    doc
                        .fontSize(10)
                        .text(`Payment for mentorship session with ${mentorUser.name} from ` +
                        `${collab.startDate
                            ? new Date(collab.startDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })
                            : "Not specified"} to ` +
                        `${collab.endDate
                            ? new Date(collab.endDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })
                            : "Not specified"}`);
                    doc.moveDown(2);
                    doc.fontSize(12).text("Contact Information", { underline: true });
                    doc.moveDown(0.5);
                    doc
                        .fontSize(10)
                        .text("For any inquiries, please contact ConnectSphere support at support@connectsphere.com.");
                    doc.end();
                });
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error generating PDF receipt for collaboration ${collabId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to generate PDF receipt", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deleteMentorRequestService = async (requestId) => {
            try {
                logger_1.default.debug(`Deleting mentor request in service: ${requestId}`);
                if (!mongoose_1.Types.ObjectId.isValid(requestId)) {
                    throw new error_handler_1.ServiceError("Invalid request ID: must be a 24 character hex string", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                await this._collabRepository.deleteMentorRequest(requestId);
                logger_1.default.info(`Mentor request deleted: ${requestId}`);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deleting mentor request ${requestId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to delete mentor request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._collabRepository = collaboartionRepository;
        this._contactRepository = contactRepository;
        this._mentorRepository = mentorRepository;
        this._userRepository = userRepository;
        this._notificationService = notificationService;
    }
    async hasMentorSlotConflict(mentorId, day, time) {
        const lockedSlots = await this._collabRepository.getLockedSlotsByMentorId(mentorId);
        const normalizedDay = day.trim().toLowerCase();
        const normalizedTime = time.trim().toLowerCase();
        return lockedSlots.some((slot) => {
            const slotDay = slot.day.trim().toLowerCase();
            if (slotDay !== normalizedDay)
                return false;
            return slot.timeSlots.some((t) => t.trim().toLowerCase() === normalizedTime);
        });
    }
    async hasUserCollabSlotConflict(userId, day, time) {
        const collaborations = await this._collabRepository.getCollabDataForUser(userId);
        const normalizedDay = day.trim().toLowerCase();
        const normalizedTime = time.trim().toLowerCase();
        return collaborations.some((collab) => {
            // Skip cancelled or completed collabs
            if (collab.isCancelled || collab.isCompleted)
                return false;
            if (!Array.isArray(collab.selectedSlot))
                return false;
            return collab.selectedSlot.some((slot) => {
                if (!slot.day || !Array.isArray(slot.timeSlots))
                    return false;
                const slotDay = slot.day.trim().toLowerCase();
                if (slotDay !== normalizedDay)
                    return false;
                return slot.timeSlots.some((t) => t.trim().toLowerCase() === normalizedTime);
            });
        });
    }
};
exports.CollaborationService = CollaborationService;
exports.CollaborationService = CollaborationService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('ICollaborationRepository')),
    __param(1, (0, inversify_1.inject)('IContactRepository')),
    __param(2, (0, inversify_1.inject)('IMentorRepository')),
    __param(3, (0, inversify_1.inject)('IUserRepository')),
    __param(4, (0, inversify_1.inject)('INotificationService')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], CollaborationService);
//# sourceMappingURL=collaboration-service.js.map