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
exports.UserConnectionController = void 0;
const inversify_1 = require("inversify");
const logger_1 = __importDefault(require("../core/utils/logger"));
const base_controller_1 = require("../core/controller/base-controller");
const messages_1 = require("../constants/messages");
let UserConnectionController = class UserConnectionController extends base_controller_1.BaseController {
    constructor(userConnectionServ) {
        super();
        this.sendRequest = async (req, res, next) => {
            try {
                const { id: requesterId } = req.params;
                const { recipientId } = req.body;
                logger_1.default.debug(`Sending connection request: requester=${requesterId}, recipient=${recipientId}`);
                const newConnection = await this._userConnectionService.sendUserConnectionRequest(requesterId, recipientId);
                this.sendSuccess(res, newConnection, messages_1.USER_CONNECTION_MESSAGES.CONNECTION_REQUEST_SENT);
            }
            catch (error) {
                logger_1.default.error(`Error in sendRequest: ${error.message}`);
                next(error);
            }
        };
        this.respondToRequest = async (req, res, next) => {
            try {
                const { connectionId } = req.params;
                const { action } = req.body;
                logger_1.default.debug(`Responding to connection request: connectionId=${connectionId}, action=${action}`);
                const result = await this._userConnectionService.respondToConnectionRequest(connectionId, action);
                const message = action.toLowerCase() === "accepted"
                    ? messages_1.USER_CONNECTION_MESSAGES.REQUEST_ACCEPTED
                    : messages_1.USER_CONNECTION_MESSAGES.REQUEST_REJECTED;
                this.sendSuccess(res, result, message);
            }
            catch (error) {
                logger_1.default.error(`Error in respondToRequest: ${error.message}`);
                next(error);
            }
        };
        this.disconnectConnection = async (req, res, next) => {
            try {
                const { connectionId } = req.params;
                const { disconnectionReason } = req.body;
                const disconnected = await this._userConnectionService.disconnectConnection(connectionId, disconnectionReason);
                this.sendSuccess(res, disconnected, messages_1.USER_CONNECTION_MESSAGES.CONNECTION_DISCONNECTED);
                res.status(200).json({
                    success: true,
                    message: messages_1.USER_CONNECTION_MESSAGES.CONNECTION_DISCONNECTED,
                    data: disconnected,
                });
            }
            catch (error) {
                logger_1.default.error(`Error in disconnectConnection: ${error.message}`);
                next(error);
            }
        };
        this.getUserConnections = async (req, res, next) => {
            try {
                const { userId } = req.params;
                logger_1.default.debug(`Fetching connections for user: ${userId}`);
                const connections = await this._userConnectionService.fetchUserConnections(userId);
                const data = connections.length === 0 ? [] : connections;
                const message = connections.length === 0 ? messages_1.USER_CONNECTION_MESSAGES.NO_CONNECTIONS_FOUND_FOR_USER : messages_1.USER_CONNECTION_MESSAGES.CONNECTIONS_FETCHED;
                this.sendSuccess(res, data, message);
            }
            catch (error) {
                logger_1.default.error(`Error in getUserConnections: ${error.message}`);
                next(error);
            }
        };
        this.getUserRequests = async (req, res, next) => {
            try {
                const { userId } = req.params;
                logger_1.default.debug(`Fetching user requests for user: ${userId}`);
                const { sentRequests, receivedRequests } = await this._userConnectionService.fetchUserRequests(userId);
                const data = sentRequests.length === 0 && receivedRequests.length === 0 ? { sentRequests: [], receivedRequests: [] } : { sentRequests, receivedRequests };
                const message = sentRequests.length === 0 && receivedRequests.length === 0
                    ? messages_1.USER_CONNECTION_MESSAGES.NO_CONNECTIONS_FOUND_FOR_USER
                    : messages_1.USER_CONNECTION_MESSAGES.USER_REQUESTS_FETCHED;
                this.sendSuccess(res, data, message);
            }
            catch (error) {
                logger_1.default.error(`Error in getUserRequests: ${error.message}`);
                next(error);
            }
        };
        this.getAllUserConnections = async (req, res, next) => {
            try {
                const page = parseInt(req.query.page, 10) || 1;
                const limit = parseInt(req.query.limit, 10) || 12;
                const search = req.query.search || '';
                const { connections, total } = await this._userConnectionService.fetchAllUserConnections(page, limit, search);
                const data = connections.length === 0 ? [] : connections;
                this.sendSuccess(res, { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
                });
            }
            catch (error) {
                logger_1.default.error(`Error in getAllUserConnectionsPaginated: ${error.message}`);
                next(error);
            }
        };
        this.getUserConnectionById = async (req, res, next) => {
            try {
                const { connectionId } = req.params;
                logger_1.default.debug(`Fetching user connection by ID: ${connectionId}`);
                const connection = await this._userConnectionService.fetchUserConnectionById(connectionId);
                this.sendSuccess(res, connection, messages_1.USER_CONNECTION_MESSAGES.USER_CONNECTION_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error in getUserConnectionById: ${error.message}`);
                next(error);
            }
        };
        this._userConnectionService = userConnectionServ;
    }
};
exports.UserConnectionController = UserConnectionController;
exports.UserConnectionController = UserConnectionController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IUserConnectionService')),
    __metadata("design:paramtypes", [Object])
], UserConnectionController);
//# sourceMappingURL=user-collaboration-controller.js.map