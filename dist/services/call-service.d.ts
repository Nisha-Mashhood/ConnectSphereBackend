import { ICallLogPopulated } from "../Utils/types/call-types";
import { ICallService } from "../Interfaces/Services/i-call-service";
import { ICallLogRepository } from "../Interfaces/Repository/i-call-repositry";
export declare class CallService implements ICallService {
    private _callLogRepository;
    constructor(callLogRepository: ICallLogRepository);
    getCallLogsByUserId: (userId?: string) => Promise<ICallLogPopulated[]>;
}
//# sourceMappingURL=call-service.d.ts.map