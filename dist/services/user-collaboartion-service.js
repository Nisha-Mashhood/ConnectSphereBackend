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
exports.UserConnectionService = void 0;
const inversify_1 = require("inversify");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const status_code_enums_1 = require("../enums/status-code-enums");
const user_connection_mapper_1 = require("../Utils/mappers/user-connection-mapper");
let UserConnectionService = class UserConnectionService {
    constructor(userConnectionRepository, contactRepository) {
        this.sendUserConnectionRequest = async (requesterId, recipientId) => {
            try {
                logger_1.default.debug(`Sending connection request: requester=${requesterId}, recipient=${recipientId}`);
                if (requesterId === recipientId) {
                    logger_1.default.error("Attempt to send connection request to self");
                    throw new error_handler_1.ServiceError("You cannot send a connection request to yourself", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const existingConnection = await this._userConnectionRepository.findExistingConnection(requesterId, recipientId);
                if (existingConnection) {
                    logger_1.default.error(`Pending request already exists: requester=${requesterId}, recipient=${recipientId}`);
                    throw new error_handler_1.ServiceError("A pending request already exists for this user", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const connection = await this._userConnectionRepository.createUserConnection(requesterId, recipientId);
                const connectionDTO = (0, user_connection_mapper_1.toUserConnectionDTO)(connection);
                if (!connectionDTO) {
                    logger_1.default.error(`Failed to map user connection ${connection._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map user connection to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Connection request created: ${connection._id} (requester=${requesterId}, recipient=${recipientId})`);
                return connectionDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error sending connection request from ${requesterId} to ${recipientId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to send connection request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.respondToConnectionRequest = async (connectionId, action) => {
            try {
                logger_1.default.debug(`Responding to connection request: connectionId=${connectionId}, action=${action}`);
                const validActions = ["Accepted", "Rejected"];
                if (!validActions.includes(action)) {
                    logger_1.default.error(`Invalid action: ${action}`);
                    throw new error_handler_1.ServiceError(`Action must be one of: ${validActions.join(", ")}`, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const updatedConnection = await this._userConnectionRepository.updateUserConnectionStatus(connectionId, action);
                if (!updatedConnection) {
                    logger_1.default.error(`Connection not found: ${connectionId}`);
                    throw new error_handler_1.ServiceError("Connection not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const updatedConnectionDTO = (0, user_connection_mapper_1.toUserConnectionDTO)(updatedConnection);
                if (!updatedConnectionDTO) {
                    logger_1.default.error(`Failed to map user connection ${updatedConnection._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map user connection to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                if (action === "Accepted") {
                    const requesterId = updatedConnection.requester.toString();
                    const recipientId = updatedConnection.recipient.toString();
                    const [contact1, contact2] = await Promise.all([
                        this._contactRepository.createContact({
                            userId: requesterId,
                            targetUserId: recipientId,
                            userConnectionId: connectionId,
                            type: "user-user",
                        }),
                        this._contactRepository.createContact({
                            userId: recipientId,
                            targetUserId: requesterId,
                            userConnectionId: connectionId,
                            type: "user-user",
                        }),
                    ]);
                    logger_1.default.info(`Contacts created for connection: ${connectionId}`);
                    return { updatedConnection: updatedConnectionDTO, contacts: [contact1, contact2] };
                }
                logger_1.default.info(`Connection request ${connectionId} ${action.toLowerCase()}`);
                return { updatedConnection: updatedConnectionDTO };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error responding to connection request ${connectionId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to respond to connection request", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.disconnectConnection = async (connectionId, reason) => {
            try {
                logger_1.default.debug(`Disconnecting connection: connectionId=${connectionId}`);
                if (!reason || reason.trim() === "") {
                    logger_1.default.error("Reason is required for disconnection");
                    throw new error_handler_1.ServiceError("Reason is required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const updatedConnection = await this._userConnectionRepository.disconnectUserConnection(connectionId, reason);
                if (!updatedConnection) {
                    logger_1.default.error(`Connection not found: ${connectionId}`);
                    throw new error_handler_1.ServiceError("Connection not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const updatedConnectionDTO = (0, user_connection_mapper_1.toUserConnectionDTO)(updatedConnection);
                if (!updatedConnectionDTO) {
                    logger_1.default.error(`Failed to map user connection ${updatedConnection._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map user connection to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                await this._contactRepository.deleteContact(connectionId, "user-user");
                logger_1.default.info(`Connection ${connectionId} disconnected and associated contacts deleted`);
                return updatedConnectionDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error disconnecting connection ${connectionId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to disconnect connection", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.fetchUserConnections = async (userId) => {
            try {
                logger_1.default.debug(`Fetching connections for user: ${userId}`);
                const connections = await this._userConnectionRepository.getUserConnections(userId);
                const connectionDTOs = (0, user_connection_mapper_1.toUserConnectionDTOs)(connections);
                logger_1.default.info(`Fetched ${connectionDTOs.length} connections for user: ${userId}`);
                return connectionDTOs;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching connections for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch user connections", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.fetchUserRequests = async (userId) => {
            try {
                logger_1.default.debug(`Fetching user requests for user: ${userId}`);
                const requests = await this._userConnectionRepository.getUserRequests(userId);
                const sentRequestDTOs = (0, user_connection_mapper_1.toUserConnectionDTOs)(requests.sentRequests);
                const receivedRequestDTOs = (0, user_connection_mapper_1.toUserConnectionDTOs)(requests.receivedRequests);
                logger_1.default.info(`Fetched ${sentRequestDTOs.length} sent and ${receivedRequestDTOs.length} received requests for user: ${userId}`);
                return { sentRequests: sentRequestDTOs, receivedRequests: receivedRequestDTOs };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching user requests for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch user requests", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.fetchAllUserConnections = async (page, limit, search) => {
            try {
                logger_1.default.debug(`Service – page:${page} limit:${limit} search:"${search}"`);
                const { connections, total } = await this._userConnectionRepository.getAllUserConnections(page, limit, search);
                const connectionDTOs = (0, user_connection_mapper_1.toUserConnectionDTOs)(connections);
                return { connections: connectionDTOs, total };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching paginated connections: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError('Failed to fetch paginated connections', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.fetchUserConnectionById = async (connectionId) => {
            try {
                logger_1.default.debug(`Fetching user connection by ID: ${connectionId}`);
                const connection = await this._userConnectionRepository.getUserConnectionById(connectionId);
                if (!connection) {
                    logger_1.default.warn(`Connection not found: ${connectionId}`);
                    throw new error_handler_1.ServiceError("Connection not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const connectionDTO = (0, user_connection_mapper_1.toUserConnectionDTO)(connection);
                if (!connectionDTO) {
                    logger_1.default.error(`Failed to map user connection ${connection._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map user connection to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Fetched connection: ${connectionId}`);
                return connectionDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching connection ${connectionId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch user connection", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._userConnectionRepository = userConnectionRepository;
        this._contactRepository = contactRepository;
    }
};
exports.UserConnectionService = UserConnectionService;
exports.UserConnectionService = UserConnectionService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IUserConnectionRepository')),
    __param(1, (0, inversify_1.inject)('IContactRepository')),
    __metadata("design:paramtypes", [Object, Object])
], UserConnectionService);
//# sourceMappingURL=user-collaboartion-service.js.map