import { Server, Socket } from "socket.io";
import { inject, injectable } from "inversify";
import logger from "../core/utils/logger";
import { IGroupCallSocketHandler } from "../Interfaces/Services/i-group-call-socket-handler";
import { IGroupRepository } from "../Interfaces/Repository/i-group-repositry";

@injectable()
export class GroupCallSocketHandler implements IGroupCallSocketHandler {
  private _io: Server | null = null;
  private _groupRepo: IGroupRepository;

  constructor(
    @inject("IGroupRepository") groupRepo: IGroupRepository
  ) {
    this._groupRepo = groupRepo;
  }

  public setIo(io: Server): void {
    this._io = io;
  }

  public handleGroupCallStarted(
    socket: Socket,
    data: {
      groupId: string;
      groupName: string;
      starterId: string;
      starterName: string;
      roomName: string;
      callType: "audio" | "video";
    }
  ): void {
    const room = `group_${data.groupId}`;
    logger.info(
      `[GROUP CALL] Started by ${data.starterId} in group ${data.groupId}`
    );

    socket.to(room).emit("groupCallStarted", {
      ...data,
      starterName: data.starterName || "Someone",
    });
  }

  public handleGroupCallJoined(
    socket: Socket,
    data: { groupId: string; userId: string }
  ): void {
    const room = `group_${data.groupId}`;
    socket.join(room);

    socket.to(room).emit("groupUserJoin", {
      userId: data.userId,
      groupId: data.groupId,
    });

    logger.info(
      `[GROUP CALL] User ${data.userId} joined group ${data.groupId}`
    );
  }

  public handleGroupCallEnded( data: { groupId: string; callType: "audio" | "video" } ): void {
    const room = `group_${data.groupId}`;
    logger.info(`[GROUP CALL] Ended in group ${data.groupId}`);

    this._io?.to(room).emit("groupCallEnded", data);
  }

  public async handleJoinAllMyGroupRooms(
    socket: Socket,
    data: { userId?: string }
  ): Promise<void> {
    const userId = socket.data.userId || data.userId;
    if (!userId) {
      logger.warn("[GROUP CALL] No userId provided");
      return;
    }

    try {
      const groups = await this._groupRepo.getGroupDetailsByUserId(userId);
      const groupIds = groups.map(g => g._id.toString());

      groupIds.forEach(groupId => {
        const room = `group_${groupId}`;
        socket.join(room);
        logger.info(
          `[GROUP CALL] User ${userId} auto-joined room ${room}`
        );
      });

      socket.emit("joinedAllGroupRooms", { groupIds });
    } catch (err) {
      logger.error(
        `[GROUP CALL] Failed to join groups for user ${userId}`,
        err
      );
    }
  }
}
