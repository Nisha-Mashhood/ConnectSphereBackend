"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEEDBACK_ROUTES = void 0;
exports.FEEDBACK_ROUTES = {
    SendFeedback: '/send-feedback',
    GetFeedbackForProfile: '/profile/:profileId/:profileType',
    GetFeedbackByCollabId: '/get-feedbackByCollabId/:collabId',
    ToggleVisibility: '/toggle-visibility/:feedbackId',
    GetFeedbackByMentorId: '/get-feedbackByMentorId/:mentorId',
    GetMentorFeedbacks: '/mentor/:mentorId',
    GetUserFeedbacks: '/user/:userId',
};
//# sourceMappingURL=feedback-routes.js.map