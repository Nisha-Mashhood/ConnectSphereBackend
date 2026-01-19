import { Server, Socket } from "socket.io";
export interface ISocketService {
    initialize(io: Server): void;
    handleDisconnect(socket: Socket): void;
}
//# sourceMappingURL=i-socket-service.d.ts.map