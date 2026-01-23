import { injectable } from "inversify";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { ICallTokenGenerator } from "../../Interfaces/Utils/i-call-token-generator";

@injectable()
export class AgoraTokenGenerator implements ICallTokenGenerator {
  async generateToken(
    channelName: string,
    userId: string
  ): Promise<string> {
    const appId = process.env.AGORA_APP_ID!;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE!;

    // convert string userId to numeric uid (Agora requirement)
    const uid = Number(userId.slice(-6));

    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 60 * 60;
    const currentTimestamp = Math.floor(Date.now() / 1000);

    return RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      currentTimestamp + expirationTimeInSeconds
    );
  }
}
