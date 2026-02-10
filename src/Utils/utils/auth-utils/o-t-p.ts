import { OtpPurpose, OtpRedisPayload, SendOtpParams } from "../../types/auth-types";
import { saveOtpToRedis } from "./otp-redis-helper";
import { sendEmail } from "../../../core/utils/email";
import { redisClient } from "../../../config/redis-client-config";

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

export const sendOtpAndStore = async (
  params: SendOtpParams
): Promise<string> => {
  const {
    email,
    purpose,
    emailSubject,
    emailBody,
    ttlSeconds = 300,
  } = params;

  const normalizedEmail: string = email.toLowerCase().trim();
  // const todayDate = new Date();
  

  const otp: string = generateOTP();    //generate otp
  const otpId: string = await saveOtpToRedis(    //save to redis
    {
      otp,
      email: normalizedEmail,
      purpose,
      attempts: 0,
      createdAt: Date.now(),
    },
    ttlSeconds
  );
  await sendEmail(  //send email
    normalizedEmail,
    emailSubject,
    emailBody(otp)
  );

  console.log("OTP SENT SUCCESSFULLY :",otp)

  return otpId;
};

export const getOtpByIdOnly = async (
  purpose: OtpPurpose,
  otpId: string
): Promise<OtpRedisPayload | null> => {

  const keys = await redisClient.keys(`otp:${purpose}:*:${otpId}`);
  if (keys.length === 0) return null;

  const value = await redisClient.get(keys[0]);
  return value ? JSON.parse(value) : null;
};