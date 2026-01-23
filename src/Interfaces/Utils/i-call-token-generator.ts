export interface ICallTokenGenerator {
  generateToken( channelName: string, userId: string ): Promise<string>;
}