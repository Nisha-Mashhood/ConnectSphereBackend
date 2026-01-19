import { IUserDTO } from "./i-user-dto";
import { IMentorDTO } from "./i-mentor-dto";
export interface IMentorRequestDTO {
    id: string;
    mentorRequestId: string;
    mentorId: string;
    mentor?: IMentorDTO;
    userId: string;
    user?: IUserDTO;
    selectedSlot?: {
        day: string;
        timeSlots: string[];
    };
    price: number;
    paymentStatus: "Pending" | "Paid" | "Failed";
    timePeriod: number;
    isAccepted: "Pending" | "Accepted" | "Rejected";
    createdAt: Date;
}
//# sourceMappingURL=i-mentor-request-dto.d.ts.map