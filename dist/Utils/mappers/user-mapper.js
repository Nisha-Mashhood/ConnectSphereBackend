"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserDTO = toUserDTO;
exports.toUserDTOs = toUserDTOs;
exports.toUserAdminDTO = toUserAdminDTO;
exports.toUserAdminDTOs = toUserAdminDTOs;
const image_resolver_1 = require("../utils/mappers/image-resolver");
function toUserDTO(user) {
    if (!user)
        return null;
    return {
        id: user._id.toString(),
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        jobTitle: user.jobTitle,
        industry: user.industry,
        reasonForJoining: user.reasonForJoining,
        role: user.role,
        profilePic: (0, image_resolver_1.resolveImage)(user.profilePic, "profiles"),
        coverPic: (0, image_resolver_1.resolveImage)(user.coverPic, "covers"),
        loginCount: user.loginCount,
        hasReviewed: user.hasReviewed,
    };
}
// For arrays 
function toUserDTOs(users) {
    return users.map(toUserDTO).filter((dto) => dto !== null);
}
//For admin (Including is Blocked)
function toUserAdminDTO(user) {
    if (!user)
        return null;
    return {
        id: user._id.toString(),
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        jobTitle: user.jobTitle,
        industry: user.industry,
        reasonForJoining: user.reasonForJoining,
        role: user.role,
        profilePic: (0, image_resolver_1.resolveImage)(user.profilePic, "profiles") ?? undefined,
        coverPic: (0, image_resolver_1.resolveImage)(user.coverPic, "covers") ?? undefined,
        loginCount: user.loginCount,
        hasReviewed: user.hasReviewed,
        isBlocked: user.isBlocked,
    };
}
function toUserAdminDTOs(users) {
    return users.map(toUserAdminDTO).filter((dto) => dto !== null);
}
//# sourceMappingURL=user-mapper.js.map