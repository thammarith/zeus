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

interface Point {
    sourceId: string;
    points: number;
    basePoints: number;
    multiplier: number;
    date: Date;
}

export interface MemberData extends ProfileData, CreationData {
    points: Point[];
}

export default MemberData;
