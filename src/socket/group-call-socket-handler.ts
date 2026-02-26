import { Server, Socket } from "socket.io";
import { inject, injectable } from "inversify";
import logger from "../core/utils/logger";
import { IGroupCallSocketHandler } from "../Interfaces/Services/i-group-call-socket-handler";
import { IGroupRepository } from "../Interfaces/Repository/i-group-repositry";
import { ICallLogRepository } from "../Interfaces/Repository/i-call-repositry";
import { ICallLog } from "../Interfaces/Models/i-call-log";

@injectable()
export class GroupCallSocketHandler implements IGroupCallSocketHandler {
  private _io: Server | null = null;
  private _groupRepo: IGroupRepository;
  private _callLogRepo: ICallLogRepository;
  // Track active group calls for timeout cleanup
  private _activeGroupCalls: Map<string, { 
    callId: string;
    timeout: NodeJS.Timeout;
  }> = new Map();

  constructor(
    @inject("IGroupRepository") groupRepo: IGroupRepository,
    @inject("ICallLogRepository") callLogRepo: ICallLogRepository
  ) {
    this._groupRepo = groupRepo;
    this._callLogRepo = callLogRepo;
  }

  public setIo(io: Server): void {
    this._io = io;
  }

  public async handleGroupCallStarted(
    socket: Socket,
    data: {
      groupId: string;
      groupName: string;
      starterId: string;
      starterName: string;
      roomName: string;
      callType: "audio" | "video";
    }
  ): Promise<void> {
    const room = `group_${data.groupId}`;
    logger.info(
      `[GROUP CALL] Started by ${data.starterId} in group ${data.groupId}`
    );

    try {
      const group = await this._groupRepo.getGroupById(data.groupId);
      if (!group) {
        logger.warn(`Group not found: ${data.groupId}`);
        socket.emit("error", { message: "Group not found" });
        return;
      }

      const recipientIds = group.members
        .filter(m => m.userId.toString() !== data.starterId)
        .map(m => m.userId.toString());

      const callId = `group_${data.groupId}_${Date.now()}`;
      const chatKey = `group-${data.groupId}`;

      const logData: Partial<ICallLog> = {
        CallId: callId,
        chatKey,
        callType: data.callType,
        type: "group",
        senderId: data.starterId,
        recipientIds,
        groupId: data.groupId,
        status: "ongoing",
        callerName: group.name || data.groupName || "Group Call",
        startTime: new Date(),
      };

      await this._callLogRepo.createCallLog(logData);
      logger.info(
        `Group call log created → CallId=${callId} group=${group.name || data.groupName || "Unknown"}`
      );

      const timeout = setTimeout(async () => {
        const socketsInRoom = await this._io?.in(room).allSockets();
        const connectedUserIds = new Set<string>();

        if (socketsInRoom) {
          for (const sid of socketsInRoom) {
            const clientSocket = this._io?.sockets.sockets.get(sid);
            if (clientSocket?.data.userId && clientSocket.data.userId !== data.starterId) {
              connectedUserIds.add(clientSocket.data.userId);
            }
          }
        }

        if (connectedUserIds.size === 0) {
          await this._callLogRepo.updateCallLog(callId, {
            status: "missed",
            endTime: new Date(),
          });
          logger.info(`Group call marked as missed → CallId=${callId} (no one joined)`);
        } else {
          logger.info(`Group call is ongoing → CallId=${callId}`);
        }

        this._activeGroupCalls.delete(callId);
      }, 30000); // 30 seconds

      this._activeGroupCalls.set(callId, { callId, timeout });

    } catch (error) {
      logger.error(`Error creating group call log for group ${data.groupId}`, error);
    }

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

    let callId: string | undefined;
    for (const [key, entry] of this._activeGroupCalls.entries()) {
      if (key.startsWith(`group_${data.groupId}_`)) {
        callId = key;
        clearTimeout(entry.timeout);
        this._activeGroupCalls.delete(key);
        logger.debug(`Cleared pending timeout for group call ${key}`);
        break;
      }
    }

    if (callId) {
      this._callLogRepo.updateCallLog(callId, {
        status: "completed",
        endTime: new Date(),
      }).catch(err => {
        logger.warn(`Failed to update group call log to completed: ${err.message}`);
      });
    } 

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
