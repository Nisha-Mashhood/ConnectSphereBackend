import { Server, Socket } from "socket.io";
import { EventEmitter } from "events";
import logger from "../core/utils/logger";
import {
  CallData,
  MarkAsReadData,
  Message,
  TypingData,
} from "../Utils/types/socket-service-types";
import { inject, injectable } from "inversify";
import { ISocketService } from "../Interfaces/Services/i-socket-service";
import { IChatSocketHandler } from "../Interfaces/Services/i-chat-socket-handler";
import { ICallSocketHandler } from "../Interfaces/Services/i-call-socket-handler";
import { INotificationSocketHandler } from "../Interfaces/Services/i-notification-socket-handler";
import { IGroupCallSocketHandler } from "../Interfaces/Services/i-group-call-socket-handler";

@injectable()
export class SocketService implements ISocketService {
  private _io: Server | null = null;
  public static notificationEmitter: EventEmitter = new EventEmitter();
  private _chatHandler: IChatSocketHandler;
  private _callHandler: ICallSocketHandler;
  private _groupCallHandler: IGroupCallSocketHandler;
  private _notificationHandler: INotificationSocketHandler;

  constructor(
    @inject("IChatSocketHandler") chatHandler: IChatSocketHandler,
    @inject("ICallSocketHandler") callHandler: ICallSocketHandler,
    @inject("IGroupCallSocketHandler")
    groupCallHandler: IGroupCallSocketHandler,
    @inject("INotificationSocketHandler")
    notificationHandler: INotificationSocketHandler,
  ) {
    this._chatHandler = chatHandler;
    this._callHandler = callHandler;
    this._groupCallHandler = groupCallHandler;
    this._notificationHandler = notificationHandler;
  }

  public initialize(io: Server): void {
    this._io = io;
    this._callHandler.setIo(io);
    this._groupCallHandler.setIo(io);
    this._notificationHandler.initializeSocket(io);
    this._chatHandler.setIo(io);
    // logger.info("Socket.IO server initialized");

    SocketService.notificationEmitter.on("notification", (notification) => {
      this._notificationHandler.emitTaskNotification(notification);
    });

    this._io.on("connection", (socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: Socket): void {
    logger.info(`New socket connection: ${socket.id}`);
    const userId = socket.handshake.auth.userId as string;
    socket.data.userId = userId;
    logger.info(
      `New client connected: socketId=${socket.id}, userId=${userId}, auth=${JSON.stringify(socket.handshake.auth)}`,
    );

    socket.join(`user_${userId}`);
    logger.info( `User ${userId} joined personal room: user_${userId}, socketId=${socket.id}` );
    console.log("Total sockets:", this._io?.sockets.sockets.size);

    //Fired when a user ENTERS chat screen
    socket.on("chat:online", ({ userId }) => {
      // console.log("chat:online received from:", userId);

      // Mark this socket as "user is actively inside chat UI"
      socket.data.inChat = true;
      logger.info(`[PRESENCE] User ${userId} entered chat`);

      // Build a list of users who are ALREADY inside chat
      const onlineUsers: string[] = [];
      this._io?.sockets.sockets.forEach((s) => {
        // Only include sockets that are currently inside chat
        // Exclude the current user
        if (s.data.inChat && s.data.userId ) {
          onlineUsers.push(s.data.userId);
        }
      });
      // Broadcast full online users to everyone
      this._io?.emit("chat:onlineUsers", onlineUsers);
    });

    socket.on("chat:offline", ({ userId }) => {
      socket.data.inChat = false;
      logger.info(`[PRESENCE] User ${userId} left chat`);
      //Rebuild full online list
      const onlineUsers: string[] = [];
      this._io?.sockets.sockets.forEach((s) => {
        if (s.data.inChat && s.data.userId) {
          onlineUsers.push(s.data.userId);
        }
      });

      // Broadcast full updated online users
      this._io?.emit("chat:onlineUsers", onlineUsers);
    });

    // Chat-related events
    socket.on("joinChats", (userId: string) =>
      this._chatHandler.handleJoinChats(socket, userId),
    );
    socket.on("joinUserRoom", (userId: string) =>
      this._chatHandler.handleJoinUserRoom(socket, userId),
    );
    socket.on("ensureUserRoom", (data: { userId: string }) =>
      this._chatHandler.handleEnsureUserRoom(socket, data),
    );
    socket.on("leaveUserRoom", (userId: string) =>
      this._chatHandler.handleLeaveUserRoom(socket, userId),
    );
    socket.on("activeChat", (data: { userId: string; chatKey: string }) =>
      this._chatHandler.handleActiveChat(data),
    );
    socket.on("sendMessage", (message: Message) =>
      this._chatHandler.handleSendMessage(socket, message),
    );
    socket.on("typing", (data: TypingData) =>
      this._chatHandler.handleTyping(socket, data),
    );
    socket.on("stopTyping", (data: TypingData) =>
      this._chatHandler.handleStopTyping(socket, data),
    );
    socket.on("markAsRead", (data: MarkAsReadData) =>
      this._chatHandler.handleMarkAsRead(socket, data),
    );
    socket.on("leaveChat", (userId: string) =>
      this._chatHandler.handleLeaveChat(userId),
    );

    // One-on-one call events
    socket.on("offer", (data: CallData) =>
      this._callHandler.handleOffer(socket, data),
    );
    socket.on("answer", (data: CallData) =>
      this._callHandler.handleAnswer(socket, data),
    );
    socket.on("ice-candidate", (data: CallData) =>
      this._callHandler.handleIceCandidate(socket, data),
    );
    socket.on("callEnded", (data: CallData) =>
      this._callHandler.handleCallEnded(socket, data),
    );

    // Notification events
    socket.on( "notification.read", (data: { notificationId: string; userId: string }) =>
        this._notificationHandler.handleNotificationRead(socket, data),
    );

    socket.on("disconnect", () => this.handleDisconnect(socket));

    socket.on("groupCallStarted", (data) =>
      this._groupCallHandler.handleGroupCallStarted(socket, data),
    );

    socket.on("groupCallJoined", (data) =>
      this._groupCallHandler.handleGroupCallJoined(socket, data),
    );

    socket.on("groupCallEnded", (data) =>
      this._groupCallHandler.handleGroupCallEnded(data),
    );

    socket.on("joinAllMyGroupRooms", (data) =>
      this._groupCallHandler.handleJoinAllMyGroupRooms(socket, data),
    );

    socket.on("leaveAllMyGroupRooms", (data: { userId: string }) => {
      const userId = socket.data.userId || data.userId;
      if (!userId) return;
      logger.info(`User ${userId} requested to leave all group rooms`);
    });
  }

  public handleDisconnect(socket: Socket): void {
    const userId = socket.data.userId;
    // Mark user as not in chat
      socket.data.inChat = false;
      // full online list
      const onlineUsers: string[] = [];
      this._io?.sockets.sockets.forEach((s) => {
        if (s.data.inChat && s.data.userId) {
          onlineUsers.push(s.data.userId);
        }
      });
      //Broadcast 
      this._io?.emit("chat:onlineUsers", onlineUsers);
      logger.info(`[PRESENCE] User ${userId} disconnected`);
  }
}
