"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_CONNECTION_ROUTES = void 0;
exports.USER_CONNECTION_ROUTES = {
    SendUserRequest: '/sendUser-User/:id',
    RespondToRequest: '/respond/:connectionId',
    DisconnectConnection: '/disconnect/:connectionId',
    GetUserConnections: '/connections/:userId',
    GetUserRequests: '/connections/:userId/requests',
    GetConnectionById: '/getConnection/:connectionId',
    GetAllConnections: '/getAllconnection',
};
//# sourceMappingURL=user-collaboration-routes.js.map