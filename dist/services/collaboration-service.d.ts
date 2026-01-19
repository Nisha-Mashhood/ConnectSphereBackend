import { Types } from "mongoose";
import { IMentorRequest } from "../Interfaces/Models/i-mentor-request";
import { ICollaborationService } from "../Interfaces/Services/i-collaboration-service";
import { LockedSlot } from "../Utils/types/collaboration-types";
import { ICollaborationRepository } from "../Interfaces/Repository/i-collaboration-repositry";
import { IContactRepository } from "../Interfaces/Repository/i-contact-repositry";
import { IMentorRepository } from "../Interfaces/Repository/i-mentor-repositry";
import { IUserRepository } from "../Interfaces/Repository/i-user-repositry";
import { INotificationService } from "../Interfaces/Services/i-notification-service";
import { IMentorRequestDTO } from "../Interfaces/DTOs/i-mentor-request-dto";
import { ICollaborationDTO } from "../Interfaces/DTOs/i-collaboration-dto";
import Stripe from "stripe";
export declare class CollaborationService implements ICollaborationService {
    private _collabRepository;
    private _contactRepository;
    private _mentorRepository;
    private _userRepository;
    private _notificationService;
    constructor(collaboartionRepository: ICollaborationRepository, contactRepository: IContactRepository, mentorRepository: IMentorRepository, userRepository: IUserRepository, notificationService: INotificationService);
    TemporaryRequestService: (requestData: Partial<IMentorRequest>) => Promise<IMentorRequestDTO | null>;
    getMentorRequests: (mentorId: string) => Promise<IMentorRequestDTO[]>;
    private hasMentorSlotConflict;
    private hasUserCollabSlotConflict;
    acceptRequest: (requestId: string) => Promise<IMentorRequestDTO | null>;
    rejectRequest: (requestId: string) => Promise<IMentorRequestDTO | null>;
    getRequestForUser: (userId: string) => Promise<IMentorRequestDTO[]>;
    processPaymentService: (paymentMethodId: string, amount: number, requestId: string, mentorRequestData: Partial<IMentorRequest>, email: string, returnUrl: string) => Promise<{
        paymentIntent: Stripe.PaymentIntent;
        contacts?: any[];
    }>;
    private checkAndCompleteCollaboration;
    getCollabDataForUserService: (userId: string, includeCompleted?: boolean) => Promise<ICollaborationDTO[]>;
    getCollabDataForMentorService: (mentorId: string, includeCompleted?: boolean) => Promise<ICollaborationDTO[]>;
    cancelAndRefundCollab: (collabId: string, reason: string, amount: number) => Promise<ICollaborationDTO | null>;
    getMentorRequestsService: ({ page, limit, search, }: {
        page: number;
        limit: number;
        search: string;
    }) => Promise<{
        requests: IMentorRequestDTO[];
        total: number;
        page: number;
        pages: number;
    }>;
    getCollabsService: ({ page, limit, search, }: {
        page: number;
        limit: number;
        search: string;
    }) => Promise<{
        collabs: ICollaborationDTO[];
        total: number;
        page: number;
        pages: number;
    }>;
    fetchCollabById: (collabId: string) => Promise<ICollaborationDTO | null>;
    fetchRequestById: (requestId: string) => Promise<IMentorRequestDTO | null>;
    markUnavailableDaysService: (collabId: string, updateData: {
        datesAndReasons: {
            date: Date;
            reason: string;
        }[];
        requestedBy: "user" | "mentor";
        requesterId: string;
        approvedById: string;
        isApproved: "pending" | "approved" | "rejected";
    }) => Promise<ICollaborationDTO | null>;
    updateTemporarySlotChangesService: (collabId: string, updateData: {
        datesAndNewSlots: {
            date: Date;
            newTimeSlots: string[];
        }[];
        requestedBy: "user" | "mentor";
        requesterId: string;
        approvedById: string;
        isApproved: "pending" | "approved" | "rejected";
    }) => Promise<ICollaborationDTO | null>;
    processTimeSlotRequest: (collabId: string, requestId: string, isApproved: boolean, requestType: "unavailable" | "timeSlot") => Promise<ICollaborationDTO | null>;
    getMentorLockedSlots: (mentorId: string) => Promise<LockedSlot[]>;
    calculateNewEndDate: (currentEndDate: Date, unavailableDates: Date[], selectedDay: string) => Date;
    getReceiptData: (collabId: string) => Promise<{
        mentorUser: {
            name: string;
            email: string;
        };
        user: {
            name: string;
            email: string;
            _id: Types.ObjectId;
        };
        paymentIntent: Stripe.PaymentIntent;
        collab: ICollaborationDTO;
    }>;
    generateReceiptPDF: (collabId: string) => Promise<Buffer>;
    deleteMentorRequestService: (requestId: string) => Promise<void>;
}
//# sourceMappingURL=collaboration-service.d.ts.map