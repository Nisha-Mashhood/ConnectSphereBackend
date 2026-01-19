import { IUser } from '../Interfaces/Models/i-user';
import { BaseRepository } from "../core/repositries/base-repositry";
import { UserQuery } from "../Utils/types/auth-types";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { ClientSession } from "mongoose";
export declare class UserRepository extends BaseRepository<IUser> implements IUserRepository {
    constructor();
    private toObjectId;
    createUser: (userData: Partial<IUser>) => Promise<IUser>;
    findUserByEmail: (email: string) => Promise<IUser | null>;
    getUserById: (id?: string) => Promise<IUser>;
    findOrCreateUser: (profile: {
        email: string;
        displayName?: string;
        id?: string;
        photos?: {
            value: string;
        }[];
    }, provider: string) => Promise<IUser>;
    updatePassword: (id: string, password: string) => Promise<IUser | null>;
    incrementLoginCount: (userId: string) => Promise<IUser | null>;
    updateRefreshToken: (userId: string, refreshToken: string) => Promise<IUser | null>;
    removeRefreshToken: (email: string) => Promise<IUser | null>;
    isProfileComplete: (user: IUser) => Promise<boolean>;
    getAllAdmins: () => Promise<IUser[]>;
    fetchAllUsers: () => Promise<IUser[]>;
    getAllUsers: (query?: UserQuery) => Promise<{
        users: IUser[];
        total: number;
    }>;
    updateUserProfile: (id: string, data: Partial<IUser>) => Promise<IUser | null>;
    blockUser: (id: string) => Promise<IUser | null>;
    unblockUser: (id: string) => Promise<IUser | null>;
    updateUserRole: (userId: string, role: string, options?: {
        session?: ClientSession;
    }) => Promise<IUser | null>;
}
//# sourceMappingURL=user-repository.d.ts.map