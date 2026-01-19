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
exports.MentorService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const inversify_1 = require("inversify");
const email_1 = require("../core/utils/email");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const mongoose_2 = require("mongoose");
const status_code_enums_1 = require("../enums/status-code-enums");
const mentor_mapper_1 = require("../Utils/mappers/mentor-mapper");
const mentor_experience_mapper_1 = require("../Utils/mappers/mentor-experience-mapper");
const pdfkit_1 = __importDefault(require("pdfkit"));
let MentorService = class MentorService {
    constructor(mentorRepository, userRepository, collaborationRepository, notificationService, categoryService, skillRepository, mentorExperienceRepository, collaborationService) {
        this.submitMentorRequest = async (mentorData) => {
            const session = await mongoose_1.default.startSession();
            session.startTransaction();
            let mentor = null;
            try {
                logger_1.default.debug(`Submitting mentor request for user: ${mentorData.userId}`);
                if (!mentorData.userId ||
                    !mentorData.skills ||
                    !mentorData.specialization ||
                    !mentorData.bio ||
                    !mentorData.availableSlots) {
                    logger_1.default.error("Missing required fields in mentorData");
                    throw new error_handler_1.ServiceError("User ID, skills, specialization, bio, available slots, price, and time period are required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const existingMentor = await this._mentorRepository.getMentorByUserId(mentorData.userId);
                if (existingMentor) {
                    throw new error_handler_1.ServiceError("Mentor profile already exists", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const user = await this._authRepository.getUserById(mentorData.userId);
                if (!user) {
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                if (user.role !== "mentor") {
                    await this._authRepository.updateUserRole(mentorData.userId, "mentor", { session });
                }
                if (mentorData.skills.length === 0) {
                    logger_1.default.error("At least one skill is required");
                    throw new error_handler_1.ServiceError("At least one skill is required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (mentorData.availableSlots.length === 0) {
                    logger_1.default.error("At least one available slot is required");
                    throw new error_handler_1.ServiceError("At least one available slot is required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (mentorData.price < 0) {
                    logger_1.default.error("Price cannot be negative");
                    throw new error_handler_1.ServiceError("Price cannot be negative", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (mentorData.timePeriod <= 0) {
                    logger_1.default.error("Time period must be positive");
                    throw new error_handler_1.ServiceError("Time period must be positive", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                mentor = await this._mentorRepository.saveMentorRequest({
                    userId: mentorData.userId,
                    skills: mentorData.skills,
                    specialization: mentorData.specialization,
                    bio: mentorData.bio,
                    price: mentorData.price,
                    availableSlots: mentorData.availableSlots,
                    timePeriod: mentorData.timePeriod,
                    certifications: mentorData.certifications,
                }, { session });
                logger_1.default.info(`Mentor request submitted: ${mentor._id} for user ${mentorData.userId}`);
                if (mentorData.experiences && mentorData.experiences.length > 0) {
                    const experiencePromises = mentorData.experiences.map((exp) => this._mentorExperienceRepository.createOne({
                        mentorId: mentor?._id,
                        role: exp.role,
                        organization: exp.organization,
                        startDate: new Date(exp.startDate),
                        endDate: exp.endDate ? new Date(exp.endDate) : undefined,
                        isCurrent: exp.isCurrent,
                        description: exp.description || undefined,
                    }, { session }));
                    const createdExperiences = await Promise.all(experiencePromises);
                    logger_1.default.info(`Created ${createdExperiences.length} experiences for mentor ${mentor._id}`);
                }
                // Commit transaction
                await session.commitTransaction();
                logger_1.default.info("Transaction committed successfully — mentor and experiences saved atomically");
                try {
                    const admins = await this._authRepository.getAllAdmins();
                    if (!admins || admins.length === 0) {
                        logger_1.default.warn("No admins found to notify for new mentor request");
                    }
                    else {
                        for (const admin of admins) {
                            const notification = await this._notificationService.sendNotification(admin._id.toString(), "new_mentor", mentorData.userId, mentor._id.toString(), "user");
                            logger_1.default.info(`Created new_mentor notification for admin ${admin._id}: ${notification.id}`);
                        }
                    }
                }
                catch (notifError) {
                    logger_1.default.error("Failed to send admin notifications", notifError);
                }
                return (0, mentor_mapper_1.toMentorDTO)(mentor);
            }
            catch (error) {
                await session.abortTransaction();
                logger_1.default.error("Transaction aborted — rolling back all changes");
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error submitting mentor request for user ${mentorData.userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to submit mentor request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
            finally {
                session.endSession();
            }
        };
        this.getAllMentorRequests = async (page = 1, limit = 10, search = "", status = "", sort = "desc") => {
            try {
                logger_1.default.debug(`Fetching mentor requests with page: ${page}, limit: ${limit}, search: ${search}, status: ${status}, sort: ${sort}`);
                if (page < 1 || limit < 1) {
                    logger_1.default.error("Invalid pagination parameters");
                    throw new error_handler_1.ServiceError("Page and limit must be positive numbers", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const validSorts = ["asc", "desc"];
                if (!validSorts.includes(sort)) {
                    logger_1.default.error(`Invalid sort order: ${sort}`);
                    throw new error_handler_1.ServiceError(`Sort must be one of: ${validSorts.join(", ")}`, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const validStatuses = ["Processing", "Completed", "Rejected", ""];
                if (!validStatuses.includes(status)) {
                    logger_1.default.error(`Invalid status: ${status}`);
                    throw new error_handler_1.ServiceError(`Status must be one of: ${validStatuses.join(", ")}`, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const result = await this._mentorRepository.getAllMentorRequests(page, limit, search, status, sort);
                logger_1.default.info(`Fetched ${result.mentors.length} mentor requests, total: ${result.total}`);
                return {
                    mentors: (0, mentor_mapper_1.toMentorDTOs)(result.mentors),
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
        this.getAllMentors = async (query) => {
            try {
                logger_1.default.debug(`Fetching all approved mentors with query: ${JSON.stringify(query)}`);
                const modifiedQuery = { ...query };
                if (query.category && mongoose_2.Types.ObjectId.isValid(query.category)) {
                    const categoryDoc = await this._categoryRepository.getCategoryById(query.category);
                    if (categoryDoc) {
                        modifiedQuery.category = categoryDoc.name;
                        logger_1.default.info(`Mapped category ID: ${query.category} to name: ${categoryDoc.name}`);
                    }
                    else {
                        logger_1.default.warn(`Category ID not found: ${query.category}`);
                        throw new error_handler_1.ServiceError("Category not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                    }
                }
                else if (query.category) {
                    logger_1.default.info(`Using provided category name: ${query.category}`);
                }
                if (query.skill && mongoose_2.Types.ObjectId.isValid(query.skill)) {
                    const skillDoc = await this._skillRepository.getSkillById(query.skill);
                    if (skillDoc) {
                        modifiedQuery.skill = skillDoc.name;
                        logger_1.default.info(`Mapped skill ID: ${query.skill} to name: ${skillDoc.name}`);
                    }
                    else {
                        logger_1.default.warn(`Skill ID not found: ${query.skill}`);
                        throw new error_handler_1.ServiceError("Skill not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                    }
                }
                else if (query.skill) {
                    logger_1.default.info(`Using provided skill name: ${query.skill}`);
                }
                const result = await this._mentorRepository.getAllMentors(modifiedQuery);
                logger_1.default.info(`Fetched ${result.mentors.length} mentors, total: ${result.total}`);
                return {
                    mentors: result.mentors,
                    total: result.total,
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching mentors: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch mentors", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getMentorByMentorId = async (mentorId) => {
            try {
                logger_1.default.debug(`Fetching mentor by ID: ${mentorId}`);
                if (!mongoose_2.Types.ObjectId.isValid(mentorId)) {
                    logger_1.default.error("Invalid mentor ID");
                    throw new error_handler_1.ServiceError("Mentor ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const mentor = await this._mentorRepository.getMentorById(mentorId);
                if (!mentor) {
                    logger_1.default.warn(`Mentor not found: ${mentorId}`);
                    return null;
                }
                logger_1.default.info(`Fetched mentor: ${mentorId}`);
                return (0, mentor_mapper_1.toMentorDTO)(mentor);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching mentor ${mentorId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch mentor", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getMentorExperiences = async (mentorId) => {
            try {
                logger_1.default.debug(`Fetching experiences for mentor ID: ${mentorId}`);
                if (!mongoose_2.Types.ObjectId.isValid(mentorId)) {
                    logger_1.default.error("Invalid mentor ID format");
                    throw new error_handler_1.ServiceError("Invalid mentor ID", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const experiences = await this._mentorExperienceRepository.findByMentorId(mentorId);
                if (!experiences || experiences.length === 0) {
                    logger_1.default.info(`No experiences found for mentor: ${mentorId}`);
                    return [];
                }
                logger_1.default.info(`Fetched ${experiences.length} experiences for mentor: ${mentorId}`);
                return (0, mentor_experience_mapper_1.toMentorExperienceDTOs)(experiences);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching experiences for mentor ${mentorId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch mentor experiences", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.approveMentorRequest = async (id) => {
            try {
                logger_1.default.debug(`Approving mentor request: ${id}`);
                if (!mongoose_2.Types.ObjectId.isValid(id)) {
                    logger_1.default.error("Invalid mentor request ID");
                    throw new error_handler_1.ServiceError("Mentor request ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const mentor = await this._mentorRepository.approveMentorRequest(id);
                if (!mentor) {
                    logger_1.default.error(`Mentor not found: ${id}`);
                    throw new error_handler_1.ServiceError("Mentor not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const user = await this._authRepository.getUserById(mentor.userId.toString());
                if (!user) {
                    logger_1.default.error(`User not found for mentor userId: ${mentor.userId}`);
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                await (0, email_1.sendEmail)(user.email, "Mentor Request Approved", `Hello ${user.name},\n\nCongratulations! Your mentor request has been approved.\n\nBest regards,\nAdmin\nConnectSphere`);
                logger_1.default.info(`Approval email sent to: ${user.email}`);
                const notification = await this._notificationService.sendNotification(user._id.toString(), "mentor_approved", user._id.toString(), user._id.toString(), "user");
                logger_1.default.info(`Created mentor_approved notification for user ${user._id}: ${notification.id}`);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error approving mentor request ${id}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to approve mentor request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.rejectMentorRequest = async (id, reason) => {
            try {
                logger_1.default.debug(`Rejecting mentor request: ${id}`);
                if (!mongoose_2.Types.ObjectId.isValid(id)) {
                    logger_1.default.error("Invalid mentor request ID");
                    throw new error_handler_1.ServiceError("Mentor request ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (!reason || reason.trim() === "") {
                    logger_1.default.error("Reason is required for rejection");
                    throw new error_handler_1.ServiceError("Reason is required for rejecting mentor request", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const mentor = await this._mentorRepository.rejectMentorRequest(id);
                if (!mentor) {
                    logger_1.default.error(`Mentor not found: ${id}`);
                    throw new error_handler_1.ServiceError("Mentor not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const user = await this._authRepository.getUserById(mentor.userId.toString());
                if (!user) {
                    logger_1.default.error(`User not found for mentor userId: ${mentor.userId}`);
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                await (0, email_1.sendEmail)(user.email, "Mentor Request Rejected", `Hello ${user.name},\n\nWe regret to inform you that your mentor request has been rejected.\n\nReason: ${reason}\n\nBest regards,\nAdmin\nConnectSphere`);
                logger_1.default.info(`Rejection email sent to: ${user.email}`);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error rejecting mentor request ${id}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to reject mentor request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.cancelMentorship = async (id) => {
            const session = await mongoose_1.default.startSession();
            session.startTransaction();
            try {
                logger_1.default.debug(`Cancelling mentorship for mentor ID: ${id}`);
                if (!mongoose_2.Types.ObjectId.isValid(id)) {
                    throw new error_handler_1.ServiceError("Mentor ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                // First, cancel the mentor profile
                const mentor = await this._mentorRepository.cancelMentorship(id, { session });
                if (!mentor) {
                    throw new error_handler_1.ServiceError("Mentor not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const user = await this._authRepository.getUserById(mentor.userId.toString());
                if (!user) {
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                // Send email to mentor about account cancellation
                await (0, email_1.sendEmail)(user.email, "Mentorship Cancelled by Admin", `Hello ${user.name},\n\nWe regret to inform you that your mentorship privileges have been revoked by the administrator.\n\nAll your ongoing collaborations have been cancelled and users have been refunded where applicable.\n\nIf you believe this is a mistake, please contact support.\n\nBest regards,\nAdmin\nConnectSphere`);
                logger_1.default.info(`Mentorship cancellation email sent to: ${user.email}`);
                //active collaborations
                const activeCollabs = await this._collabService.getCollabDataForMentorService(id, false);
                if (activeCollabs.length > 0) {
                    logger_1.default.info(`Found ${activeCollabs.length} active collaborations for mentor ${id}. Processing cancellations...`);
                    const cancelReason = "Admin has cancelled the mentor's mentorship account.";
                    const refundPercentage = 0.5;
                    for (const collab of activeCollabs) {
                        try {
                            const refundAmount = collab.price * refundPercentage;
                            await this._collabService.cancelAndRefundCollab(collab.id, cancelReason, refundAmount);
                            logger_1.default.info(`Successfully cancelled and refunded collaboration ${collab.id} (refund: ₹${refundAmount})`);
                        }
                        catch (cancelError) {
                            logger_1.default.error(`Failed to cancel collaboration ${collab.id} during mentor cancellation: ${cancelError.message}`);
                        }
                    }
                }
                else {
                    logger_1.default.info(`No active collaborations found for mentor ${id}`);
                }
                await session.commitTransaction();
                logger_1.default.info(`Mentorship successfully cancelled for mentor ${id} with all active collaborations processed`);
            }
            catch (error) {
                await session.abortTransaction();
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error cancelling mentorship ${id}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to cancel mentorship", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
            finally {
                session.endSession();
            }
        };
        this.getMentorByUserId = async (userId) => {
            try {
                logger_1.default.debug(`Fetching mentor by user ID: ${userId}`);
                if (!mongoose_2.Types.ObjectId.isValid(userId)) {
                    logger_1.default.error("Invalid user ID");
                    throw new error_handler_1.ServiceError("User ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const mentor = await this._mentorRepository.getMentorByUserId(userId);
                if (!mentor) {
                    logger_1.default.warn(`Mentor not found for user: ${userId}`);
                    return null;
                }
                logger_1.default.info(`Fetched mentor for user: ${userId}`);
                return (0, mentor_mapper_1.toMentorDTO)(mentor);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching mentor for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch mentor", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateMentorById = async (mentorId, updateData) => {
            try {
                logger_1.default.debug(`Updating mentor: ${mentorId}`);
                if (!mongoose_2.Types.ObjectId.isValid(mentorId)) {
                    logger_1.default.error("Invalid mentor ID");
                    throw new error_handler_1.ServiceError("Mentor ID must be a valid ObjectId", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const mentor = await this._mentorRepository.getMentorById(mentorId);
                if (!mentor) {
                    logger_1.default.error(`Mentor not found: ${mentorId}`);
                    throw new error_handler_1.ServiceError("Mentor not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const updatedMentor = await this._mentorRepository.updateMentorById(mentorId, updateData);
                if (!updatedMentor) {
                    logger_1.default.error(`Failed to update mentor: ${mentorId}`);
                    throw new error_handler_1.ServiceError("Failed to update mentor", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Mentor updated: ${mentorId}`);
                return (0, mentor_mapper_1.toMentorDTO)(updatedMentor);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating mentor ${mentorId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to update mentor", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getMentorAnalytics = async (page = 1, limit = 10, sortBy = "totalEarnings", sortOrder = "desc", search = "") => {
            try {
                logger_1.default.debug(`Fetching mentor analytics with page=${page}, limit=${limit}, sortBy=${sortBy}, sortOrder=${sortOrder}, search=${search}`);
                const { mentors } = await this._mentorRepository.getAllMentors();
                const analytics = await Promise.all(mentors.map(async (mentor) => {
                    const collaborations = await this._collabRepository.findByMentorId(mentor.id.toString());
                    const totalCollaborations = collaborations.length;
                    const totalEarnings = collaborations.reduce((sum, c) => sum + (c.price - 100), 0);
                    const platformFees = totalCollaborations * 100;
                    const avgCollabPrice = totalCollaborations > 0 ? totalEarnings / totalCollaborations : 0;
                    const user = mentor.userId
                        ? await this._authRepository.getUserById(mentor.userId._id.toString())
                        : null;
                    return {
                        mentorId: mentor.id.toString(),
                        name: user?.name || "Unknown",
                        email: user?.email || "Unknown",
                        specialization: mentor.specialization,
                        approvalStatus: mentor.isApproved,
                        totalCollaborations,
                        totalEarnings,
                        platformFees,
                        avgCollabPrice,
                    };
                }));
                const searchLower = search.toLowerCase();
                const filteredAnalytics = analytics.filter((mentor) => mentor.name.toLowerCase().includes(searchLower) ||
                    mentor.email.toLowerCase().includes(searchLower) ||
                    (mentor.specialization?.toLowerCase() || "").includes(searchLower));
                const sortedAnalytics = filteredAnalytics.sort((a, b) => {
                    const mul = sortOrder === "asc" ? 1 : -1;
                    return mul * (a[sortBy] - b[sortBy]);
                });
                const total = sortedAnalytics.length;
                const startIndex = (page - 1) * limit;
                const paginatedAnalytics = sortedAnalytics.slice(startIndex, startIndex + limit);
                return {
                    mentors: paginatedAnalytics,
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                };
            }
            catch (error) {
                logger_1.default.error("Error fetching mentor analytics:", error);
                throw new error_handler_1.ServiceError("Failed to fetch mentor analytics", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, error);
            }
        };
        this.getSalesReport = async (period) => {
            try {
                logger_1.default.debug(`Fetching sales report for period: ${period}`);
                const validPeriods = ["1month", "1year", "5years"];
                if (!validPeriods.includes(period)) {
                    logger_1.default.error(`Invalid period: ${period}`);
                    throw new error_handler_1.ServiceError(`Period must be one of: ${validPeriods.join(", ")}`, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const periods = {
                    "1month": 30 * 24 * 60 * 60 * 1000,
                    "1year": 365 * 24 * 60 * 60 * 1000,
                    "5years": 5 * 365 * 24 * 60 * 60 * 1000,
                };
                const timeFilter = periods[period];
                const startDate = new Date(Date.now() - timeFilter);
                const collaborations = await this._collabRepository.findByDateRange(startDate, new Date());
                const totalRevenue = collaborations.reduce((sum, collab) => sum + (collab.price || 0), 0);
                const platformRevenue = collaborations.length * 100;
                const mentorRevenue = totalRevenue - platformRevenue;
                const mentorIds = [
                    ...new Set(collaborations
                        .map((c) => {
                        if (typeof c.mentorId === "object" &&
                            c.mentorId !== null &&
                            "_id" in c.mentorId) {
                            return c.mentorId._id.toString();
                        }
                        else if (typeof c.mentorId === "string" &&
                            mongoose_2.Types.ObjectId.isValid(c.mentorId)) {
                            return c.mentorId;
                        }
                        logger_1.default.warn(`Invalid mentorId format in collaboration: ${JSON.stringify(c.mentorId)}`);
                        return null;
                    })
                        .filter((id) => id !== null)),
                ];
                const mentorBreakdown = await Promise.all(mentorIds.map(async (mentorId) => {
                    try {
                        const mentor = await this._mentorRepository.getMentorById(mentorId);
                        const mentorCollabs = collaborations.filter((c) => (typeof c.mentorId === "string" && c.mentorId === mentorId) ||
                            (typeof c.mentorId === "object" &&
                                c.mentorId !== null &&
                                c.mentorId._id.toString() === mentorId));
                        const user = mentor
                            ? await this._authRepository.getUserById(mentor.userId?._id.toString())
                            : null;
                        return {
                            mentorId,
                            name: user?.name || "Unknown",
                            email: user?.email || "Unknown",
                            collaborations: mentorCollabs.length,
                            mentorEarnings: mentorCollabs.reduce((sum, c) => sum + (c.price - 100), 0),
                            platformFees: mentorCollabs.length * 100,
                        };
                    }
                    catch (error) {
                        const err = error instanceof Error ? error : new Error(String(error));
                        logger_1.default.error(`Error processing mentorId ${mentorId}: ${err.message}`);
                        return {
                            mentorId,
                            name: "Unknown",
                            email: "Unknown",
                            collaborations: 0,
                            mentorEarnings: 0,
                            platformFees: 0,
                        };
                    }
                }));
                logger_1.default.info(`Fetched sales report for period ${period}: totalRevenue=${totalRevenue}, platformRevenue=${platformRevenue}`);
                return {
                    period,
                    totalRevenue,
                    platformRevenue,
                    mentorRevenue,
                    mentorBreakdown,
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching sales report for period ${period}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch sales report", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.generateSalesReportPDF = async (period = "1month") => {
            try {
                const reportData = await this.getSalesReport(period);
                const periodLabel = period === "1month" ? "Last 30 Days" :
                    period === "1year" ? "Last 1 Year" :
                        "Last 5 Years";
                return new Promise((resolve, reject) => {
                    const doc = new pdfkit_1.default({ margin: 50, size: "A4" });
                    const buffers = [];
                    doc.on("data", buffers.push.bind(buffers));
                    doc.on("end", () => {
                        const pdfBuffer = Buffer.concat(buffers);
                        resolve(pdfBuffer);
                    });
                    doc.on("error", reject);
                    // Header
                    doc.fontSize(28).text("ConnectSphere Sales Report", { align: "center" });
                    doc.fontSize(18).text(`Period: ${periodLabel}`, { align: "center" });
                    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
                    doc.moveDown(3);
                    // Revenue Summary Section
                    doc.fontSize(20).text("Revenue Summary", { underline: true });
                    doc.moveDown(1);
                    const summary = [
                        { label: "Total Revenue (paid by students)", value: `₹${reportData.totalRevenue.toFixed(2)}` },
                        { label: "Platform Fee (₹100 per collaboration)", value: `₹${reportData.platformRevenue.toFixed(2)}` },
                        { label: "Mentor Earnings (after platform fee)", value: `₹${reportData.mentorRevenue.toFixed(2)}` },
                        { label: "Total Collaborations Completed", value: reportData.mentorBreakdown.reduce((sum, m) => sum + m.collaborations, 0).toString() },
                    ];
                    summary.forEach(item => {
                        doc.fontSize(14).text(item.label, { continued: true, align: "left" });
                        doc.text(item.value, { align: "right" });
                        doc.moveDown(0.5);
                    });
                    doc.moveDown(3);
                    // Explanation for New Admins
                    doc.fontSize(16).text("Understanding the Report", { underline: true });
                    doc.moveDown(1);
                    doc.fontSize(11).list([
                        "Total Revenue: Full amount students paid for mentorship sessions.",
                        "Platform Fee: ₹100 deducted from each completed collaboration as service fee.",
                        "Mentor Earnings: Amount transferred to mentors (session price - ₹100).",
                        "Sessions: Number of successfully completed mentorship programs.",
                    ], { bulletRadius: 3, textIndent: 20 });
                    doc.moveDown(3);
                    // Mentor Breakdown Table
                    if (reportData.mentorBreakdown.length === 0) {
                        doc.fontSize(14).text("No mentor earnings in this period.", { align: "center" });
                    }
                    else {
                        doc.fontSize(20).text("Mentor Earnings Breakdown", { underline: true });
                        doc.moveDown(1);
                        // Table headers
                        const tableTop = doc.y;
                        const xPositions = [50, 130, 250, 350, 450];
                        const headers = ["Mentor Name", "Email", "Sessions", "Mentor Earnings", "Platform Fee"];
                        doc.font("Helvetica-Bold");
                        headers.forEach((header, i) => {
                            doc.fontSize(11).text(header, xPositions[i], tableTop);
                        });
                        doc.moveDown(1);
                        // Rows
                        doc.font("Helvetica");
                        reportData.mentorBreakdown.forEach((mentor) => {
                            const y = doc.y;
                            doc.fontSize(10)
                                .text((mentor.name || "Unknown").substring(0, 20), xPositions[0], y)
                                .text((mentor.email || "Unknown").substring(0, 25), xPositions[1], y)
                                .text(`${mentor.collaborations.toString()}`, xPositions[2], y)
                                .text(`₹${mentor.mentorEarnings.toFixed(2)}`, xPositions[3], y)
                                .text(`₹${mentor.platformFees.toFixed(2)}`, xPositions[4], y);
                            doc.moveDown(0.8);
                        });
                    }
                    // Footer
                    doc.moveDown(5);
                    doc.fontSize(10).text("This report is confidential and intended for administrative use only.", { align: "center" });
                    doc.end();
                });
            }
            catch (error) {
                logger_1.default.error("Error in generateSalesReportPDF:", error);
                throw new error_handler_1.ServiceError("Failed to generate sales report PDF", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
            }
        };
        this.addMentorExperience = async (userId, data) => {
            try {
                const mentor = await this._mentorRepository.getMentorByUserId(userId);
                if (!mentor)
                    throw new error_handler_1.ServiceError("Mentor profile not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                if (mentor.isApproved !== "Completed") {
                    throw new error_handler_1.ServiceError("Only approved mentors can add experiences", status_code_enums_1.StatusCodes.FORBIDDEN);
                }
                const experience = await this._mentorExperienceRepository.createOne({
                    mentorId: mentor._id,
                    role: data.role,
                    organization: data.organization,
                    startDate: new Date(data.startDate),
                    endDate: data.endDate ? new Date(data.endDate) : undefined,
                    isCurrent: data.isCurrent || false,
                    description: data.description,
                });
                return (0, mentor_experience_mapper_1.toMentorExperienceDTO)(experience);
            }
            catch (error) {
                throw error instanceof error_handler_1.ServiceError ? error : new error_handler_1.ServiceError("Failed to add experience", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
            }
        };
        this.updateMentorExperience = async (userId, experienceId, data) => {
            try {
                const mentor = await this._mentorRepository.getMentorByUserId(userId);
                if (!mentor)
                    throw new error_handler_1.ServiceError("Mentor profile not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                if (mentor.isApproved !== "Completed")
                    throw new error_handler_1.ServiceError("Only approved mentors can update experiences", status_code_enums_1.StatusCodes.FORBIDDEN);
                const existing = await this._mentorExperienceRepository.findById(experienceId);
                if (!existing)
                    throw new error_handler_1.ServiceError("Experience not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                if (existing.mentorId.toString() !== mentor._id.toString()) {
                    throw new error_handler_1.ServiceError("Unauthorized: Cannot edit another mentor's experience", status_code_enums_1.StatusCodes.FORBIDDEN);
                }
                const updated = await this._mentorExperienceRepository.update(experienceId, {
                    role: data.role,
                    organization: data.organization,
                    startDate: data.startDate ? new Date(data.startDate) : undefined,
                    endDate: data.isCurrent ? undefined : data.endDate ? new Date(data.endDate) : undefined,
                    isCurrent: data.isCurrent,
                    description: data.description,
                });
                if (!updated)
                    throw new error_handler_1.ServiceError("Failed to update experience", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                return (0, mentor_experience_mapper_1.toMentorExperienceDTO)(updated);
            }
            catch (error) {
                throw error instanceof error_handler_1.ServiceError ? error : new error_handler_1.ServiceError("Failed to update experience", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
            }
        };
        this.deleteMentorExperience = async (userId, experienceId) => {
            try {
                const mentor = await this._mentorRepository.getMentorByUserId(userId);
                if (!mentor)
                    throw new error_handler_1.ServiceError("Mentor profile not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                if (mentor.isApproved !== "Completed")
                    throw new error_handler_1.ServiceError("Only approved mentors can delete experiences", status_code_enums_1.StatusCodes.FORBIDDEN);
                const existing = await this._mentorExperienceRepository.findById(experienceId);
                if (!existing)
                    throw new error_handler_1.ServiceError("Experience not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                if (existing.mentorId.toString() !== mentor._id.toString()) {
                    throw new error_handler_1.ServiceError("Unauthorized: Cannot delete another mentor's experience", status_code_enums_1.StatusCodes.FORBIDDEN);
                }
                const deleted = await this._mentorExperienceRepository.delete(experienceId);
                if (!deleted)
                    throw new error_handler_1.ServiceError("Failed to delete experience", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
            }
            catch (error) {
                throw error instanceof error_handler_1.ServiceError ? error : new error_handler_1.ServiceError("Failed to delete experience", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
            }
        };
        this._mentorRepository = mentorRepository;
        this._authRepository = userRepository;
        this._collabRepository = collaborationRepository;
        this._notificationService = notificationService;
        this._categoryRepository = categoryService;
        this._skillRepository = skillRepository;
        this._mentorExperienceRepository = mentorExperienceRepository;
        this._collabService = collaborationService;
    }
};
exports.MentorService = MentorService;
exports.MentorService = MentorService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("IMentorRepository")),
    __param(1, (0, inversify_1.inject)("IUserRepository")),
    __param(2, (0, inversify_1.inject)("ICollaborationRepository")),
    __param(3, (0, inversify_1.inject)("INotificationService")),
    __param(4, (0, inversify_1.inject)("ICategoryRepository")),
    __param(5, (0, inversify_1.inject)("ISkillsRepository")),
    __param(6, (0, inversify_1.inject)("IMentorExperienceRepository")),
    __param(7, (0, inversify_1.inject)('ICollaborationService')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], MentorService);
//# sourceMappingURL=mentor-service.js.map