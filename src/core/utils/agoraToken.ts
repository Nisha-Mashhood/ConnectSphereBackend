import { injectable } from "inversify";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { ICallTokenGenerator } from "../../Interfaces/Utils/i-call-token-generator";

@injectable()
export class AgoraTokenGenerator implements ICallTokenGenerator {
  async generateToken( channelName: string ): Promise<{ token: string; agoraUid: number }> {
    const appId = process.env.AGORA_APP_ID!;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE!;
    
    const agoraUid = Math.floor(Math.random() * 100000000);
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 60 * 60;
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      agoraUid,
      role,
      currentTimestamp + expirationTimeInSeconds
    );

    return {
      token,
      agoraUid,
    };
  }
}
