import { Server, Socket } from "socket.io";

export interface IGroupCallSocketHandler {
  setIo(io: Server): void;

  handleGroupCallStarted(
    socket: Socket,
    data: {
      groupId: string;
      groupName: string;
      starterId: string;
      starterName: string;
      roomName: string;
      callType: "audio" | "video";
    }
  ): void;

  handleGroupCallJoined(
    socket: Socket,
    data: { groupId: string; userId: string }
  ): void;

  handleGroupCallEnded( data: { groupId: string; callType: "audio" | "video" } ): void;

  handleJoinAllMyGroupRooms(
    socket: Socket,
    data: { userId?: string }
  ): Promise<void>;
}
