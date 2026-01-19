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
exports.MentorController = void 0;
const inversify_1 = require("inversify");
const base_controller_1 = require("../core/controller/base-controller");
const cloudinary_1 = require("../core/utils/cloudinary");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const messages_1 = require("../constants/messages");
const error_messages_1 = require("../constants/error-messages");
let MentorController = class MentorController extends base_controller_1.BaseController {
    constructor(mentorService) {
        super();
        this.checkMentorStatus = async (req, res, next) => {
            try {
                const { id } = req.params;
                const mentor = await this._mentorService.getMentorByUserId(id);
                this.sendSuccess(res, { mentor: mentor || null }, messages_1.MENTOR_MESSAGES.MENTOR_STATUS_RETRIEVED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMentorDetails = async (req, res, next) => {
            try {
                const { mentorId } = req.params;
                const mentor = await this._mentorService.getMentorByMentorId(mentorId);
                if (!mentor) {
                    this.sendSuccess(res, mentor, messages_1.MENTOR_MESSAGES.NO_MENTOR_FOUND);
                    return;
                }
                this.sendSuccess(res, { mentor }, messages_1.MENTOR_MESSAGES.MENTOR_DETAILS_RETRIEVED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMentorExperiences = async (req, res, next) => {
            try {
                const { mentorId } = req.params;
                const experiences = await this._mentorService.getMentorExperiences(mentorId);
                if (!experiences) {
                    this.sendSuccess(res, experiences, messages_1.MENTOR_MESSAGES.NO_MENTOR_EXPERIENCE_FOUND);
                    return;
                }
                this.sendSuccess(res, { experiences }, messages_1.MENTOR_MESSAGES.MENTOR_EXPERIENCE_DETAILS_RETRIEVED);
            }
            catch (error) {
                next(error);
            }
        };
        this.createMentor = async (req, res, next) => {
            try {
                const { userId, specialization, bio, price, skills, availableSlots, timePeriod, experiences } = req.body;
                let parsedExperiences = experiences ? JSON.parse(experiences) : [];
                if (!Array.isArray(parsedExperiences)) {
                    throw new error_handler_1.HttpError("Experiences must be an array", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                let uploadedCertificates = [];
                if (req.files && Array.isArray(req.files) && req.files.length > 0) {
                    const files = req.files;
                    const uploadPromises = files.map((file) => (0, cloudinary_1.uploadMedia)(file.path, "mentor_certificates", file.size).then((result) => result.url));
                    uploadedCertificates = await Promise.all(uploadPromises);
                }
                else {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.CERTIFICATES_REQUIRED, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const newMentor = await this._mentorService.submitMentorRequest({
                    userId,
                    skills: JSON.parse(skills),
                    specialization,
                    bio,
                    price,
                    availableSlots: JSON.parse(availableSlots),
                    timePeriod,
                    certifications: uploadedCertificates,
                    experiences: parsedExperiences,
                });
                this.sendCreated(res, newMentor, messages_1.MENTOR_MESSAGES.MENTOR_REGISTRATION_SUBMITTED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllMentorRequests = async (req, res, next) => {
            try {
                const { page = "1", limit = "10", search = "", status = "", sort = "desc" } = req.query;
                const mentorRequests = await this._mentorService.getAllMentorRequests(parseInt(page), parseInt(limit), search, status, sort);
                if (mentorRequests.mentors.length === 0) {
                    this.sendSuccess(res, { mentors: [], total: 0 }, messages_1.MENTOR_MESSAGES.NO_MENTOR_REQUESTS_FOUND);
                    return;
                }
                this.sendSuccess(res, {
                    mentors: mentorRequests.mentors,
                    total: mentorRequests.total,
                    currentPage: parseInt(page),
                    totalPages: mentorRequests.pages,
                }, messages_1.MENTOR_MESSAGES.MENTOR_REQUESTS_RETRIEVED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllMentors = async (req, res, next) => {
            try {
                const { search, page, limit, skill, category, sortBy, sortOrder, excludeMentorId } = req.query;
                const query = {};
                if (search)
                    query.search = search;
                if (page)
                    query.page = parseInt(page, 10);
                if (limit)
                    query.limit = parseInt(limit, 10);
                if (skill)
                    query.skill = skill;
                if (category)
                    query.category = category;
                if (sortBy)
                    query.sortBy = sortBy;
                if (sortOrder)
                    query.sortOrder = sortOrder;
                if (excludeMentorId)
                    query.excludeMentorId = excludeMentorId;
                logger_1.default.debug(`Fetching mentors with query: ${JSON.stringify(query)}`);
                const result = await this._mentorService.getAllMentors(query);
                if (result.mentors.length === 0) {
                    this.sendSuccess(res, { mentors: [], total: 0, page: query.page || 1, limit: query.limit || 10 }, messages_1.MENTOR_MESSAGES.NO_MENTORS_FOUND);
                    return;
                }
                const data = !search && !page && !limit && !skill
                    ? result.mentors
                    : {
                        mentors: result.mentors,
                        total: result.total,
                        page: query.page || 1,
                        limit: query.limit || 10,
                    };
                this.sendSuccess(res, data, messages_1.MENTOR_MESSAGES.MENTORS_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error in getAllMentors: ${error.message}`);
                next(error);
            }
        };
        this.getMentorByUserId = async (req, res, next) => {
            try {
                const { userId } = req.params;
                const mentor = await this._mentorService.getMentorByUserId(userId);
                if (!mentor) {
                    this.sendSuccess(res, mentor, messages_1.MENTOR_MESSAGES.NO_MENTOR_FOUND);
                    return;
                }
                this.sendSuccess(res, mentor, messages_1.MENTOR_MESSAGES.MENTOR_RETRIEVED);
            }
            catch (error) {
                next(error);
            }
        };
        this.approveMentorRequest = async (req, res, next) => {
            try {
                const { id } = req.params;
                await this._mentorService.approveMentorRequest(id);
                this.sendSuccess(res, null, messages_1.MENTOR_MESSAGES.MENTOR_REQUEST_APPROVED);
            }
            catch (error) {
                next(error);
            }
        };
        this.rejectMentorRequest = async (req, res, next) => {
            try {
                const { id } = req.params;
                const { reason } = req.body;
                if (!reason) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REJECTION_REASON_REQUIRED, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                await this._mentorService.rejectMentorRequest(id, reason);
                this.sendSuccess(res, null, messages_1.MENTOR_MESSAGES.MENTOR_REQUEST_REJECTED);
            }
            catch (error) {
                next(error);
            }
        };
        this.cancelMentorship = async (req, res, next) => {
            try {
                const { mentorId } = req.params;
                await this._mentorService.cancelMentorship(mentorId);
                this.sendSuccess(res, null, messages_1.MENTOR_MESSAGES.MENTORSHIP_CANCELLED);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateMentorProfile = async (req, res, next) => {
            try {
                const { mentorId } = req.params;
                const updateData = req.body;
                const mentorData = await this._mentorService.updateMentorById(mentorId, updateData);
                this.sendSuccess(res, mentorData, messages_1.MENTOR_MESSAGES.MENTOR_PROFILE_UPDATED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMentorAnalytics = async (req, res, next) => {
            try {
                const { page = "1", limit = "10", sortBy = "totalEarnings", sortOrder = "desc", search = "" } = req.query;
                const validSortFields = ["totalEarnings", "platformFees", "totalCollaborations", "avgCollabPrice"];
                const validatedSortBy = validSortFields.includes(sortBy)
                    ? sortBy
                    : "totalEarnings";
                const validSortOrders = ["asc", "desc"];
                const validatedSortOrder = validSortOrders.includes(sortOrder)
                    ? sortOrder
                    : "desc";
                const analytics = await this._mentorService.getMentorAnalytics(parseInt(page) || 1, parseInt(limit) || 10, validatedSortBy, validatedSortOrder, search);
                this.sendSuccess(res, {
                    mentors: analytics.mentors,
                    total: analytics.total,
                    currentPage: parseInt(page) || 1,
                    totalPages: analytics.pages,
                }, messages_1.MENTOR_MESSAGES.MENTOR_ANALYTICS_RETRIEVED);
            }
            catch (error) {
                next(error);
            }
        };
        this.getSalesReport = async (req, res, next) => {
            try {
                const { period = "1month" } = req.query;
                const report = await this._mentorService.getSalesReport(period);
                this.sendSuccess(res, report, messages_1.MENTOR_MESSAGES.SALES_REPORT_RETRIEVED);
            }
            catch (error) {
                next(error);
            }
        };
        this.addExperience = async (req, res, next) => {
            try {
                const userId = req.query.userId;
                if (!userId) {
                    throw new error_handler_1.HttpError("Unauthorized", status_code_enums_1.StatusCodes.UNAUTHORIZED);
                }
                const experienceData = req.body;
                const newExperience = await this._mentorService.addMentorExperience(userId, experienceData);
                this.sendSuccess(res, { experience: newExperience }, "Experience added successfully");
            }
            catch (error) {
                next(error);
            }
        };
        this.updateExperience = async (req, res, next) => {
            try {
                const userId = req.query.userId;
                const { experienceId } = req.params;
                const updateData = req.body;
                if (!userId || !experienceId) {
                    throw new error_handler_1.HttpError("Invalid request", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const updatedExperience = await this._mentorService.updateMentorExperience(userId, experienceId, updateData);
                this.sendSuccess(res, { experience: updatedExperience }, "Experience updated successfully");
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteExperience = async (req, res, next) => {
            try {
                const userId = req.query.userId;
                const { experienceId } = req.params;
                if (!userId || !experienceId) {
                    throw new error_handler_1.HttpError("Invalid request", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                await this._mentorService.deleteMentorExperience(userId, experienceId);
                this.sendSuccess(res, null, "Experience deleted successfully");
            }
            catch (error) {
                next(error);
            }
        };
        this.downloadSalesReportPDF = async (req, res, next) => {
            const { period } = req.query;
            if (!period || typeof period !== "string") {
                res.status(400).json({ message: "Period query parameter is required" });
                return;
            }
            try {
                logger_1.default.debug(`Admin requested sales report PDF for period: ${period}`);
                const pdfBuffer = await this._mentorService.generateSalesReportPDF(period);
                const periodLabel = period === "1month" ? "Last-30-Days" :
                    period === "1year" ? "Last-1-Year" :
                        "Last-5-Years";
                const filename = `sales-report-${periodLabel}-${new Date().toISOString().split("T")[0]}.pdf`;
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
                res.send(pdfBuffer);
            }
            catch (error) {
                logger_1.default.error(`Error in downloadSalesReportPDF: ${error.message}`);
                next(error);
            }
        };
        this._mentorService = mentorService;
    }
};
exports.MentorController = MentorController;
exports.MentorController = MentorController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IMentorService')),
    __metadata("design:paramtypes", [Object])
], MentorController);
//# sourceMappingURL=mentor-controller.js.map