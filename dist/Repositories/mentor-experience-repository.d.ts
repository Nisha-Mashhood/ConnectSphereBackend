import { BaseRepository } from "../core/repositries/base-repositry";
import { IMentorExperience } from "../Interfaces/Models/i-mentor-experience";
import { IMentorExperienceRepository } from "../Interfaces/Repository/i-mentor-experience-repository";
import { ClientSession } from "mongoose";
export declare class MentorExperienceRepository extends BaseRepository<IMentorExperience> implements IMentorExperienceRepository {
    constructor();
    private toObjectId;
    createOne(data: Partial<IMentorExperience>, options?: {
        session?: ClientSession;
    }): Promise<IMentorExperience>;
    findByMentorId(mentorId: string): Promise<IMentorExperience[]>;
    updateById(id: string, data: Partial<IMentorExperience>): Promise<IMentorExperience | null>;
    updateMany(filter: object, data: Partial<IMentorExperience>): Promise<number>;
    deleteById(id: string): Promise<boolean>;
}
//# sourceMappingURL=mentor-experience-repository.d.ts.map