export interface CreationData {
    userId: string;
    phoneNumber: string;
    createdAt: Date;
}

interface MemberData {
    firstName: string;
    lastName: string;
    membershipId?: string;
}

export interface AccessData {
    lastAccessAt: Date;
    lastModifiedAt: Date;
}

export default interface UserData extends AccessData, MemberData, CreationData {}

interface Point {
    sourceId: string;
    points: number;
    basePoints: number;
    multiplier: number;
    date: Date;
}
