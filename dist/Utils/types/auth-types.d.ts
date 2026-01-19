import { IUserDTO } from '../../Interfaces/DTOs/i-user-dto';
import { IUser } from '../../Interfaces/Models/i-user';
import { Request } from "express";
export interface SignupRequestBody {
    name: string;
    email: string;
    password: string;
}
export interface LoginRequestBody {
    email: string;
    password: string;
}
export interface OAuthRequestBody {
    code: string;
}
export interface RefreshTokenRequestBody {
    refreshToken: string;
}
export interface ForgotPasswordRequestBody {
    email: string;
}
export interface VerifyOTPRequestBody {
    purpose: OtpPurpose;
    email: string;
    otpId: string;
    otp: string;
}
export interface ResetPasswordRequestBody {
    email: string;
    newPassword: string;
}
export interface LogoutRequestBody {
    email: string;
}
export interface VerifyPasskeyRequestBody {
    passkey: string;
}
export interface UpdateProfileRequestBody extends Partial<IUser> {
    profilePicFile?: Request["file"];
    coverPicFile?: Request["file"];
}
export interface SignupData {
    name: string;
    email: string;
    password: string;
}
export interface ProfileUpdateData extends Partial<IUser> {
    profilePicFile?: Request["file"];
    coverPicFile?: Request["file"];
}
export type UserQuery = {
    search?: string;
    sortField?: 'industry' | 'reasonForJoining' | 'hasReviewed';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    excludeId?: string;
    status?: string;
};
export interface UpdatePasswordRequestBody {
    currentPassword: string;
    newPassword: string;
}
export type OtpPurpose = "signup" | "login" | "forgot-password" | "google-login" | "github-login" | "forgot_password";
export interface OtpRedisPayload {
    otp: string;
    email: string;
    purpose: OtpPurpose;
    attempts: number;
    createdAt: number;
}
export interface SendOtpParams {
    email: string;
    purpose: OtpPurpose;
    emailSubject: string;
    emailBody: (otp: string) => string;
    ttlSeconds?: number;
}
export interface VerifyOtpLoginResult {
    purpose: "login";
    user: IUserDTO;
    accessToken: string;
    refreshToken: string;
    needsReviewPrompt: boolean;
}
export interface VerifyOtpGenericResult {
    purpose: Exclude<OtpPurpose, "login">;
    email: string;
}
export type VerifyOtpResult = VerifyOtpLoginResult | VerifyOtpGenericResult;
//# sourceMappingURL=auth-types.d.ts.map