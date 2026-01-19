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
exports.ContactMessageRepository = void 0;
const inversify_1 = require("inversify");
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const contact_message_model_1 = __importDefault(require("../Models/contact-message-model"));
const status_code_enums_1 = require("../enums/status-code-enums");
let ContactMessageRepository = class ContactMessageRepository extends base_repositry_1.BaseRepository {
    constructor() {
        super(contact_message_model_1.default);
        this.createContactMessage = async (data) => {
            try {
                logger_1.default.debug(`Creating contact message from: ${data.email}`);
                const message = await this.create({
                    ...data,
                    givenReply: false,
                    createdAt: new Date(),
                });
                logger_1.default.info(`Contact message created: ${message._id}`);
                return message;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating contact message from ${data.email}`, err);
                throw new error_handler_1.RepositoryError('Error creating contact message', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateReplyStatus = async (contactMessageId) => {
            try {
                logger_1.default.debug(`Updating reply status for contact message: ${contactMessageId}`);
                const message = await this.model
                    .findByIdAndUpdate(contactMessageId, { givenReply: true }, { new: true })
                    .exec();
                if (!message) {
                    logger_1.default.warn(`Contact message not found: ${contactMessageId}`);
                    throw new error_handler_1.RepositoryError(`Contact message not found with ID: ${contactMessageId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Reply status updated for contact message: ${contactMessageId}`);
                return message;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating reply status for contact message ${contactMessageId}`, err);
                throw new error_handler_1.RepositoryError('Error updating reply status', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
    }
    async getAllContactMessages({ page = 1, limit = 10, search = "", dateFilter = "all", }) {
        try {
            logger_1.default.debug(`Fetching contact messages (page=${page}, limit=${limit}, search=${search}, dateFilter=${dateFilter})`);
            const matchStage = {};
            if (search.trim() !== "") {
                matchStage.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { message: { $regex: search, $options: "i" } },
                ];
            }
            if (dateFilter !== "all") {
                const now = new Date();
                let startDate = null;
                if (dateFilter === "today") {
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                }
                else if (dateFilter === "7days") {
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                }
                else if (dateFilter === "30days") {
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                }
                if (startDate) {
                    matchStage.createdAt = { $gte: startDate };
                }
            }
            const pipeline = [
                { $match: matchStage },
                { $sort: { createdAt: -1 } },
                {
                    $facet: {
                        messages: [
                            { $skip: (page - 1) * limit },
                            { $limit: limit },
                            {
                                $project: {
                                    _id: 1,
                                    contactMessageId: 1,
                                    name: 1,
                                    email: 1,
                                    message: 1,
                                    createdAt: 1,
                                    givenReply: 1,
                                },
                            },
                        ],
                        total: [{ $count: "count" }],
                    },
                },
            ];
            const result = await this.model.aggregate(pipeline).exec();
            const messages = result[0]?.messages || [];
            const total = result[0]?.total[0]?.count || 0;
            return {
                messages: messages,
                total,
                page,
                pages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger_1.default.error("Error fetching paginated contact messages", error);
            throw new error_handler_1.RepositoryError("Error fetching paginated contact messages", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, error);
        }
    }
};
exports.ContactMessageRepository = ContactMessageRepository;
exports.ContactMessageRepository = ContactMessageRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], ContactMessageRepository);
//# sourceMappingURL=contact-us-repository.js.map