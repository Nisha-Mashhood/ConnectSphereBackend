import { BaseRepository } from "../core/repositries/base-repositry";
import { ICallLog } from "../Interfaces/Models/i-call-log";
import { ICallLogPopulated } from "../Utils/types/call-types";
import { ICallLogRepository } from "../Interfaces/Repository/i-call-repositry";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
export declare class CallLogRepository extends BaseRepository<ICallLog> implements ICallLogRepository {
    private _userRepository;
    constructor(userRepository: IUserRepository);
    createCallLog: (data: Partial<ICallLog>) => Promise<ICallLog>;
    updateCallLog: (CallId: string, data: Partial<ICallLog>) => Promise<ICallLog | null>;
    findCallLogByCallId: (CallId: string) => Promise<ICallLog | null>;
    findCallLogsByUserId: (userId: string) => Promise<ICallLogPopulated[]>;
}
//# sourceMappingURL=call-repository.d.ts.map