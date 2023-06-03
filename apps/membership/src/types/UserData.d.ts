import { Point } from "./Point";

interface AuthData {
    isAdmin?: boolean;
}

export interface CreationData {
    userId: string;
    phoneNumber: string;
}

export interface ProfileData {
    firstName?: string;
    lastName?: string;
    email?: string;
    membershipId?: string;
}

export interface MemberPoint extends Point {
    sourceId: string;
    awardedAt: Date;
    awardedBy: string;
}

export interface MemberData extends AuthData, ProfileData, CreationData {
    points: MemberPoint[];
}

export default MemberData;
