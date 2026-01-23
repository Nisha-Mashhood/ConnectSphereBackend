import { inject, injectable } from "inversify";
import logger from "../core/utils/logger";
import { ServiceError } from "../core/utils/error-handler";
import { ICallLogPopulated } from "../Utils/types/call-types";
import { ICallService } from "../Interfaces/Services/i-call-service";
import { ICallLogRepository } from "../Interfaces/Repository/i-call-repositry";
import { ICallTokenGenerator } from "../Interfaces/Utils/i-call-token-generator";

@injectable()
export class CallService implements ICallService{
  private _callLogRepository: ICallLogRepository;
  private _callTokenGenerator: ICallTokenGenerator;

  constructor(
    @inject('ICallLogRepository') callLogRepository : ICallLogRepository ,
    @inject('ICallTokenGenerator') callTokenGenerator: ICallTokenGenerator
  ) {
    this._callLogRepository = callLogRepository;
    this._callTokenGenerator = callTokenGenerator;
  }

  public getCallLogsByUserId = async(userId?: string): Promise<ICallLogPopulated[]> => {
    try {
      if (!userId) {
        logger.error("User ID is required");
        throw new ServiceError("User ID is required");
      }
      logger.debug(`Fetching call logs for userId: ${userId}`);
      const callLogs = await this._callLogRepository.findCallLogsByUserId(userId);
      logger.info(`Retrieved ${callLogs.length} call logs for userId: ${userId}`);
      return callLogs;
    } catch (error: any) {
      logger.error(`Error in CallService.getCallLogsByUserId: ${error.message}`);
      throw new ServiceError(`Failed to fetch call logs: ${error.message}`);
    }
  }

  public generateGroupCallToken =  async( groupId: string, userId: string ): Promise<string> => {
    try {
      if (!userId || groupId) {
        logger.error("User ID  and group Id both are required");
        throw new ServiceError("User ID and group Id are required");
      }
      logger.debug(`Creating Token for Agora fro Group call : ${userId}`);
      const channelName = `group-${groupId}`;
      const token = this._callTokenGenerator.generateToken(channelName, userId);
      logger.info(`created Token using agora ${token} call logs for userId: ${userId}`);
      return token;
    } catch (error) {
      logger.error(`Error in CallService.generateGroupCallToken: ${error}`);
      throw new ServiceError(`Failed to create Token: ${error}`);
    }
  }
}