import { OtpPurpose, OtpRedisPayload } from "../../types/auth-types";
export declare const generateOtpId: () => string;
export declare const saveOtpToRedis: (payload: OtpRedisPayload, ttlSeconds?: number) => Promise<string>;
export declare const getOtpFromRedis: (purpose: OtpPurpose, email: string, otpId: string) => Promise<OtpRedisPayload | null>;
export declare const deleteOtpFromRedis: (purpose: OtpPurpose, email: string, otpId: string) => Promise<void>;
export declare const incrementOtpAttempts: (purpose: OtpPurpose, email: string, otpId: string) => Promise<number>;
export declare const verifyOtpFromRedis: (purpose: OtpPurpose, email: string, otpId: string, providedOtp: string, maxAttempts?: number) => Promise<OtpRedisPayload>;
//# sourceMappingURL=otp-redis-helper.d.ts.map