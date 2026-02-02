import { ICallLogPopulated } from "../../Utils/types/call-types";

export interface ICallService {
    getCallLogsByUserId: (userId?: string) => Promise<ICallLogPopulated[]>;
    generateGroupCallToken: ( groupId: string ) => Promise<{ token: string; agoraUid: number; channelName: string }>;
}