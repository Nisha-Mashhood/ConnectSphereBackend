export interface ICallTokenGenerator {
  generateToken( channelName: string ): Promise<{ token: string; agoraUid: number }>;
}