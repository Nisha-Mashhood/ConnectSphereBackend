"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const inversify_1 = require("inversify");
const user_model_1 = __importDefault(require("../Models/user-model"));
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const mongoose_1 = require("mongoose");
const status_code_enums_1 = require("../enums/status-code-enums");
let UserRepository = class UserRepository extends base_repositry_1.BaseRepository {
    constructor() {
        super(user_model_1.default);
        this.toObjectId = (id) => {
            if (!id) {
                logger_1.default.warn('Missing ID when converting to ObjectId');
                throw new error_handler_1.RepositoryError('Invalid ID: ID is required', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            const idStr = typeof id === 'string' ? id : id.toString();
            if (!mongoose_1.Types.ObjectId.isValid(idStr)) {
                logger_1.default.warn(`Invalid ObjectId format: ${idStr}`);
                throw new error_handler_1.RepositoryError('Invalid ID: must be a 24 character hex string', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            return new mongoose_1.Types.ObjectId(idStr);
        };
        // Create a new user
        this.createUser = async (userData) => {
            try {
                return await this.create(userData);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating user ${userData.email}`, err);
                throw new error_handler_1.RepositoryError('Error creating user', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        // Find a user by email
        this.findUserByEmail = async (email) => {
            try {
                logger_1.default.debug(`Fetching user by email: ${email}`);
                const user = await this.findOne({ email });
                if (!user) {
                    logger_1.default.info(`No user found with email: ${email}`);
                    return null;
                }
                logger_1.default.info(`User fetched: ${user._id} (${email})`);
                return user;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching user by email ${email}`, err);
                throw new error_handler_1.RepositoryError('Error fetching user by email', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        //Find a User By id
        this.getUserById = async (id) => {
            if (!id) {
                logger_1.default.warn('Missing ID for getUserById');
                throw new error_handler_1.RepositoryError('Invalid ID: ID is required', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            try {
                const user = await this.findById(id);
                if (!user) {
                    logger_1.default.warn(`User not found: ${id}`);
                    throw new error_handler_1.RepositoryError(`User not found with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`User fetched: ${id} (${user.email})`);
                return user;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching user by ID ${id}`, err);
                throw new error_handler_1.RepositoryError('Error fetching user by ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        // Find or create a user by OAuth profile
        this.findOrCreateUser = async (profile, provider) => {
            try {
                const email = profile.email;
                let user = await this.findUserByEmail(email);
                if (!user) {
                    user = await this.create({
                        name: profile.displayName || "Unknown",
                        email,
                        provider,
                        providerId: profile.id,
                        profilePic: profile.photos?.[0]?.value || null,
                        role: "user",
                    });
                    logger_1.default.info(`Created OAuth user: ${email} via ${provider}`);
                }
                return user;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error in findOrCreateUser for ${profile.email}`, err);
                throw new error_handler_1.RepositoryError('Error finding or creating user', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        // Update user password
        this.updatePassword = async (id, password) => {
            try {
                logger_1.default.debug(`Updating password for user: ${id}`);
                const user = await this.update(id, { password });
                if (!user) {
                    logger_1.default.warn(`User not found: ${id}`);
                    throw new error_handler_1.RepositoryError(`User not found with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Password updated for user: ${id}`);
                return user;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating password for user ${id}`, err);
                throw new error_handler_1.RepositoryError('Error updating password', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        // Increment login count
        this.incrementLoginCount = async (userId) => {
            try {
                logger_1.default.debug(`Incrementing login count for user: ${userId}`);
                const user = await this.findByIdAndUpdate(userId, { $inc: { loginCount: 1 } }, { new: true });
                if (!user) {
                    logger_1.default.warn(`User not found: ${userId}`);
                    throw new error_handler_1.RepositoryError(`User not found with ID: ${userId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Login count incremented for user: ${userId}`);
                return user;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error incrementing login count for user ${userId}`, err);
                throw new error_handler_1.RepositoryError('Error incrementing login count', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        // Update refresh token
        this.updateRefreshToken = async (userId, refreshToken) => {
            try {
                logger_1.default.debug(`Updating refresh token for user: ${userId}`);
                const user = await this.update(userId, { refreshToken });
                if (!user) {
                    logger_1.default.warn(`User not found: ${userId}`);
                    throw new error_handler_1.RepositoryError(`User not found with ID: ${userId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Refresh token updated for user: ${userId}`);
                return user;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating refresh token for user ${userId}`, err);
                throw new error_handler_1.RepositoryError('Error updating refresh token', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        // Remove refresh token
        this.removeRefreshToken = async (email) => {
            try {
                logger_1.default.debug(`Removing refresh token for user with email: ${email}`);
                const user = await this.model.findOneAndUpdate({ email }, { $unset: { refreshToken: '' } }, { new: true });
                if (!user) {
                    logger_1.default.warn(`User not found with email: ${email}`);
                    throw new error_handler_1.RepositoryError(`User not found with email: ${email}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Refresh token removed for user: ${user._id} (${email})`);
                return user;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error removing refresh token for email ${email}`, err);
                throw new error_handler_1.RepositoryError('Error removing refresh token', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        // Check if profile is complete
        this.isProfileComplete = async (user) => {
            try {
                logger_1.default.debug(`Checking profile completion for user: ${user._id}`);
                const requiredFields = [
                    'phone',
                    'dateOfBirth',
                    'jobTitle',
                    'industry',
                    'reasonForJoining',
                ];
                for (const field of requiredFields) {
                    if (!user[field]) {
                        logger_1.default.info(`Profile incomplete for user: ${user._id} (${user.email}) - missing ${field}`);
                        return false;
                    }
                }
                logger_1.default.info(`Profile complete for user: ${user._id} (${user.email})`);
                return true;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error checking profile completion for user ${user._id}`, err);
                throw new error_handler_1.RepositoryError('Error checking profile completion', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllAdmins = async () => {
            try {
                logger_1.default.debug(`Fetching all admin users`);
                const users = await this.model.find({ role: 'admin' }).exec();
                logger_1.default.info(`Fetched ${users.length} admin users`);
                return users;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching admin users`, err);
                throw new error_handler_1.RepositoryError('Error fetching admin users', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.fetchAllUsers = async () => {
            try {
                logger_1.default.debug(`Fetching all users`);
                const users = await this.model.find({ role: { $ne: 'admin' } }).exec();
                logger_1.default.info(`Fetched ${users.length} users`);
                return users;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching users`, err);
                throw new error_handler_1.RepositoryError('Error fetching users', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        //Fetch All User Details
        this.getAllUsers = async (query = {}) => {
            try {
                const { search, page = 1, limit = 10, excludeId, status } = query;
                logger_1.default.debug(`Fetching users → ${JSON.stringify({ search, page, limit, excludeId })}`);
                const matchStage = {
                    role: 'user',
                };
                if (excludeId) {
                    try {
                        matchStage._id = { $ne: this.toObjectId(excludeId) };
                    }
                    catch (err) {
                        logger_1.default.warn(`Invalid excludeId: ${excludeId} error ${err}`);
                    }
                }
                if (status === 'active') {
                    matchStage.isBlocked = false;
                }
                else if (status === 'blocked') {
                    matchStage.isBlocked = true;
                }
                if (search?.trim()) {
                    const regex = { $regex: search.trim(), $options: 'i' };
                    matchStage.$or = [
                        { name: regex },
                        { email: regex },
                        { jobTitle: { $regex: `^${search.trim()}`, $options: 'i' } },
                        { industry: { $regex: `^${search.trim()}`, $options: 'i' } },
                        { reasonForJoining: { $regex: `^${search.trim()}`, $options: 'i' } },
                    ];
                }
                const pipeline = [
                    { $match: matchStage },
                    {
                        $facet: {
                            users: [
                                { $skip: (page - 1) * limit },
                                { $limit: limit },
                            ],
                            total: [{ $count: 'count' }],
                        },
                    },
                ];
                const [result] = await this.model.aggregate(pipeline).exec();
                const users = result?.users ?? [];
                const total = result?.total?.[0]?.count ?? 0;
                logger_1.default.info(`Fetched ${users.length} users (total: ${total})`);
                return { users, total };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error('Error in getAllUsers', err);
                throw new error_handler_1.RepositoryError('Error fetching users', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        //Update The User Profile
        this.updateUserProfile = async (id, data) => {
            try {
                logger_1.default.debug(`Updating user profile for ID: ${id}`);
                const user = await this.findByIdAndUpdate(id, data, { new: true });
                if (!user) {
                    logger_1.default.warn(`User not found: ${id}`);
                    throw new error_handler_1.RepositoryError(`User not found with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`User profile updated: ${id} (${user.email})`);
                return user;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating user profile for ID ${id}`, err);
                throw new error_handler_1.RepositoryError('Error updating user profile', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        //Block the given User
        this.blockUser = async (id) => {
            try {
                logger_1.default.debug(`Blocking user: ${id}`);
                const user = await this.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
                if (!user) {
                    logger_1.default.warn(`User not found: ${id}`);
                    throw new error_handler_1.RepositoryError(`User not found with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`User blocked: ${id} (${user.email})`);
                return user;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error blocking user ${id}`, err);
                throw new error_handler_1.RepositoryError('Error blocking user', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        //Unblock the given user
        this.unblockUser = async (id) => {
            try {
                logger_1.default.debug(`Unblocking user: ${id}`);
                const user = await this.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
                if (!user) {
                    logger_1.default.warn(`User not found: ${id}`);
                    throw new error_handler_1.RepositoryError(`User not found with ID: ${id}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`User unblocked: ${id} (${user.email})`);
                return user;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error unblocking user ${id}`, err);
                throw new error_handler_1.RepositoryError('Error unblocking user', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        //Update The user Role
        this.updateUserRole = async (userId, role, options) => {
            try {
                logger_1.default.debug(`Updating role for user: ${userId} to ${role}`);
                const user = await this.findByIdAndUpdate(userId, { role }, { new: true }, options?.session);
                if (!user) {
                    logger_1.default.warn(`User not found: ${userId}`);
                    throw new error_handler_1.RepositoryError(`User not found with ID: ${userId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`User role updated: ${userId} to ${role}`);
                return user;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating role for user ${userId}`, err);
                throw new error_handler_1.RepositoryError('Error updating user role', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], UserRepository);
//# sourceMappingURL=user-repository.js.map