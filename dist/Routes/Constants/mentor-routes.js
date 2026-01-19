"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MENTOR_ROUTES = void 0;
exports.MENTOR_ROUTES = {
    CreateMentorProfile: '/create-mentorprofile',
    CheckMentorStatus: '/check-mentor/:id',
    GetAllMentorRequests: '/getallmentorrequest',
    ApproveMentorRequest: '/approvementorrequest/:id',
    RejectMentorRequest: '/rejectmentorrequest/:id',
    CancelMentorship: '/cancelmentorship/:mentorId',
    GetMentorDetails: '/getmentorDetails/:mentorId',
    GetMentorExperience: '/experiences/:mentorId',
    UpdateMentorProfile: '/update-mentor/:mentorId',
    GetAllMentors: '/getAllMentors',
    GetMentorByUserId: '/user/:userId',
    GetMentorAnalytics: '/mentor-analytics',
    GetSalesReport: '/sales-report',
    AddExperience: '/experiences',
    UpdateExperience: '/experiences/:experienceId',
    DeleteExperience: '/deleteexperiences/:experienceId',
    DownloadSalesReposrt: '/downloadSalesReport',
};
//# sourceMappingURL=mentor-routes.js.map