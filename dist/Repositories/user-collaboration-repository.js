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
exports.UserConnectionRepository = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const user_connection_model_1 = __importDefault(require("../Models/user-connection-model"));
const status_code_enums_1 = require("../enums/status-code-enums");
let UserConnectionRepository = class UserConnectionRepository extends base_repositry_1.BaseRepository {
    constructor() {
        super(user_connection_model_1.default);
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
        this.createUserConnection = async (requesterId, recipientId) => {
            try {
                logger_1.default.debug(`Creating user connection: requester=${requesterId}, recipient=${recipientId}`);
                return await this.create({
                    requester: this.toObjectId(requesterId),
                    recipient: this.toObjectId(recipientId),
                    requestStatus: 'Pending',
                    connectionStatus: 'Disconnected',
                    requestSentAt: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating user connection for requester ${requesterId}, recipient ${recipientId}`, err);
                throw new error_handler_1.RepositoryError('Error creating user connection', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateUserConnectionStatus = async (connectionId, status) => {
            try {
                logger_1.default.debug(`Updating user connection status: connectionId=${connectionId}, status=${status}`);
                const updateFields = {
                    requestStatus: status,
                    connectionStatus: status === 'Accepted' ? 'Connected' : 'Disconnected',
                    updatedAt: new Date(),
                };
                if (status === 'Accepted') {
                    updateFields.requestAcceptedAt = new Date();
                }
                else if (status === 'Rejected') {
                    updateFields.requestRejectedAt = new Date();
                }
                const connection = await this.findByIdAndUpdate(connectionId, updateFields, { new: true });
                if (!connection) {
                    logger_1.default.warn(`User connection not found: ${connectionId}`);
                    throw new error_handler_1.RepositoryError(`User connection not found with ID: ${connectionId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`User connection status updated: ${connectionId} to ${status}`);
                return connection;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating user connection status for connection ${connectionId}`, err);
                throw new error_handler_1.RepositoryError('Error updating user connection status', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.disconnectUserConnection = async (connectionId, reason) => {
            try {
                logger_1.default.debug(`Disconnecting user connection: connectionId=${connectionId}`);
                const connection = await this.findByIdAndUpdate(connectionId, {
                    connectionStatus: 'Disconnected',
                    disconnectedAt: new Date(),
                    disconnectionReason: reason,
                    updatedAt: new Date(),
                }, { new: true });
                if (!connection) {
                    logger_1.default.warn(`User connection not found: ${connectionId}`);
                    throw new error_handler_1.RepositoryError(`User connection not found with ID: ${connectionId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`User connection disconnected: ${connectionId}`);
                return connection;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error disconnecting user connection ${connectionId}`, err);
                throw new error_handler_1.RepositoryError('Error disconnecting user connection', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getUserConnections = async (userId) => {
            try {
                logger_1.default.debug(`Fetching connections for user: ${userId}`);
                const connections = await this.model
                    .find({
                    $or: [{ requester: this.toObjectId(userId) }, { recipient: this.toObjectId(userId) }],
                    requestStatus: 'Accepted',
                })
                    .populate('requester', '_id name email jobTitle profilePic')
                    .populate('recipient', '_id name email jobTitle profilePic')
                    .exec();
                logger_1.default.info(`Fetched ${connections.length} connections for user ${userId}`);
                return connections;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching user connections for user ${userId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching user connections', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllUserConnections = async (page = 1, limit = 12, search = '') => {
            try {
                logger_1.default.debug(`getAllUserConnections → page=${page}, limit=${limit}, search="${search}"`);
                const basePipeline = [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'requester',
                            foreignField: '_id',
                            as: 'requester',
                        },
                    },
                    { $unwind: { path: '$requester', preserveNullAndEmptyArrays: true } },
                    // Populate recipient
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'recipient',
                            foreignField: '_id',
                            as: 'recipient',
                        },
                    },
                    { $unwind: { path: '$recipient', preserveNullAndEmptyArrays: true } },
                ];
                const matchStage = { requestStatus: 'Accepted' };
                if (search.trim()) {
                    const regex = { $regex: search.trim(), $options: 'i' };
                    matchStage.$or = [
                        { 'requester.name': regex },
                        { 'requester.email': regex },
                        { 'recipient.name': regex },
                        { 'recipient.email': regex },
                    ];
                }
                const dataPipeline = [
                    ...basePipeline,
                    { $match: matchStage },
                    { $sort: { requestSentAt: -1 } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                    {
                        $project: {
                            _id: 1,
                            connectionId: 1,
                            requester: 1,
                            recipient: 1,
                            requestStatus: 1,
                            connectionStatus: 1,
                            requestSentAt: 1,
                            requestAcceptedAt: 1,
                            disconnectedAt: 1,
                            disconnectionReason: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        },
                    },
                ];
                const connections = await this.model.aggregate(dataPipeline).exec();
                const countPipeline = [
                    ...basePipeline,
                    { $match: matchStage },
                    { $count: 'total' },
                ];
                const countResult = await this.model.aggregate(countPipeline).exec();
                const total = countResult[0]?.total ?? 0;
                const pages = Math.ceil(total / limit) || 1;
                logger_1.default.info(`Fetched ${connections.length} connections | Total: ${total} | Pages: ${pages}`);
                return {
                    connections,
                    total,
                    page,
                    pages,
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error('Error in getAllUserConnections', err);
                throw new error_handler_1.RepositoryError('Error fetching user connections', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getUserRequests = async (userId) => {
            try {
                logger_1.default.debug(`Fetching sent and received requests for user: ${userId}`);
                const sentRequests = await this.model
                    .find({ requester: this.toObjectId(userId) })
                    .populate('recipient', '_id name email jobTitle profilePic')
                    .sort({ requestSentAt: -1 })
                    .exec();
                const receivedRequests = await this.model
                    .find({ recipient: this.toObjectId(userId), requestStatus: 'Pending' })
                    .populate('requester', '_id name email jobTitle profilePic')
                    .sort({ requestSentAt: -1 })
                    .exec();
                logger_1.default.info(`Fetched ${sentRequests.length} sent and ${receivedRequests.length} received requests for user ${userId}`);
                return { sentRequests, receivedRequests };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching user requests for user ${userId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching user requests', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getUserConnectionById = async (connectionId) => {
            try {
                logger_1.default.debug(`Fetching user connection by ID: ${connectionId}`);
                const connection = await this.model
                    .findById(this.toObjectId(connectionId))
                    .populate('requester', '_id name email jobTitle profilePic')
                    .populate('recipient', '_id name email jobTitle profilePic')
                    .exec();
                if (!connection) {
                    logger_1.default.warn(`User connection not found: ${connectionId}`);
                    throw new error_handler_1.RepositoryError(`User connection not found with ID: ${connectionId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`User connection fetched: ${connectionId}`);
                return connection;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching user connection by ID ${connectionId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching user connection by ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findExistingConnection = async (requesterId, recipientId) => {
            try {
                logger_1.default.debug(`Checking for existing connection: requester=${requesterId}, recipient=${recipientId}`);
                const connection = await this.model
                    .findOne({
                    requester: this.toObjectId(requesterId),
                    recipient: this.toObjectId(recipientId),
                    requestStatus: 'Pending',
                })
                    .exec();
                logger_1.default.info(connection
                    ? `Found existing connection: ${connection._id}`
                    : `No existing connection found for requester ${requesterId}, recipient ${recipientId}`);
                return connection;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error checking existing connection for requester ${requesterId}, recipient ${recipientId}`, err);
                throw new error_handler_1.RepositoryError('Error checking existing connection', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getConnectionUserIds = async (connectionId) => {
            try {
                logger_1.default.debug(`Fetching connection user IDs for connection: ${connectionId}`);
                const connection = await this.model.findById(this.toObjectId(connectionId))
                    .select("requester recipient")
                    .exec();
                if (!connection) {
                    logger_1.default.warn(`Connection not found: ${connectionId}`);
                    return null;
                }
                const result = {
                    requester: connection.requester.toString(),
                    recipient: connection.recipient.toString(),
                };
                logger_1.default.info(`Fetched user IDs for connection: ${connectionId}`);
                return result;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching connection user IDs for connection ${connectionId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching connection user IDs', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
    }
};
exports.UserConnectionRepository = UserConnectionRepository;
exports.UserConnectionRepository = UserConnectionRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], UserConnectionRepository);
//# sourceMappingURL=user-collaboration-repository.js.map