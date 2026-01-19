import { IUser } from '../../Interfaces/Models/i-user';
import { IUserAdminDTO, IUserDTO } from '../../Interfaces/DTOs/i-user-dto';
export declare function toUserDTO(user: IUser | null): IUserDTO | null;
export declare function toUserDTOs(users: IUser[]): IUserDTO[];
export declare function toUserAdminDTO(user: IUser | null): IUserAdminDTO | null;
export declare function toUserAdminDTOs(users: IUser[]): IUserAdminDTO[];
//# sourceMappingURL=user-mapper.d.ts.map