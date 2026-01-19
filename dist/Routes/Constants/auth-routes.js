"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_ROUTES = void 0;
exports.AUTH_ROUTES = {
    Register: '/signup',
    Login: '/login',
    ForgotPassword: '/forgot-password',
    VerifyOTP: '/verify-otp',
    ResentOTP: '/resend-otp',
    ResetPassword: '/reset-password',
    GoogleSignup: '/google-signup',
    GoogleLogin: '/google-login',
    GithubSignup: '/github-signup',
    GithubLogin: '/github-login',
    VerifyAdminPasskey: '/verify-admin-passkey',
    RefreshToken: '/refresh-token',
    Logout: '/logout',
    CheckProfile: '/check-profile/:id',
    ProfileDetails: '/profiledetails/:id',
    UpdateUserDetails: '/updateUserDetails/:id',
    GetAllUsers: '/getallusers',
    FetchAllUsers: '/fetchallusers',
    GetUser: '/getuser/:id',
    UpdateUser: '/users/:id',
    UpdatePassword: '/updatePassword/:id',
    BlockUser: '/blockuser/:id',
    UnblockUser: '/unblockuser/:id',
    ChangeRole: '/changerole/:id',
};
//# sourceMappingURL=auth-routes.js.map