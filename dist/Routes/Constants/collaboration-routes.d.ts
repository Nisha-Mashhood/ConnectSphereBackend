export declare const COLLABORATION_ROUTES: {
    readonly CreateMentorProfile: "/create-mentorprofile";
    readonly GetMentorRequests: "/get-mentor-requests";
    readonly AcceptRequest: "/accept-request/:id";
    readonly RejectRequest: "/reject-request/:id";
    readonly GetUserRequests: "/get-user-requests/:id";
    readonly ProcessPayment: "/process-payment";
    readonly GetCollabDataUser: "/get-collabData-user/:id";
    readonly GetCollabDataMentor: "/get-collabData-mentor/:id";
    readonly CancelAndRefundCollab: "/cancel-and-refund/:collabId";
    readonly GetCollab: "/getCollab/:collabId";
    readonly GetCollabRequest: "/getCollabRequset/:requestId";
    readonly MarkUnavailable: "/markUnavailable/:collabId";
    readonly UpdateTimeslot: "/updateTimeslot/:collabId";
    readonly ApproveTimeSlot: "/approveTimeSlot/:collabId";
    readonly GetLockedSlots: "/locked-slots/:mentorId";
    readonly GetAllMentorRequests: "/getAllRequest";
    readonly GetAllCollabs: "/getAllCollab";
    readonly GetReceiptDownload: "/receipt/:collabId";
    readonly DeleteMentorRequest: "/deleteReq/:id";
};
//# sourceMappingURL=collaboration-routes.d.ts.map