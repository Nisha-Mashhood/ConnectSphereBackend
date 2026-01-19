"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GROUP_ROUTES = void 0;
exports.GROUP_ROUTES = {
    CreateGroup: "/create-group",
    FetchGroups: "/fetch-groups/:adminId",
    GetGroupById: "/group-details/:groupId",
    GetAllGroups: "/group-details",
    SendGroupRequest: "/send-groupRequest",
    GetGroupRequestsByGroupId: "/group-request-details-GI/:groupId",
    GetGroupRequestsByAdminId: "/group-request-details-AI/:adminId",
    GetGroupRequestsByUserId: "/group-request-details-UI/:userId",
    UpdateGroupRequest: "/update-groupRequest",
    ProcessPayment: "/process-payment",
    RemoveMember: "/remove-member",
    RemoveGroup: "/remove-group/:groupId",
    UploadGroupPicture: "/upload-group-picture/:groupId",
    GetGroupDetailsForMembers: "/get-group-details-members/:userid",
    GetGroupRequestById: "/group-requests/:requestId",
    GetAllGroupRequests: "/group-requests",
};
//# sourceMappingURL=group-routes.js.map