export interface CreationData {
    userId: string;
    phoneNumber: string;
    createdAt: Date;
}

interface MemberData {
    firstName?: string;
    lastName?: string;
    email?: string;
    membershipId?: string;
}

export interface AccessData {
    lastAccessAt: Date;
    lastModifiedAt: Date;
}

interface Point {
    sourceId: string;
    points: number;
    basePoints: number;
    multiplier: number;
    date: Date;
}

export default interface UserData extends AccessData, MemberData, CreationData {
    points: Point[];
}
