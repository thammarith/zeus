export interface CreationData {
    userId: string;
    phoneNumber: string;
}

interface MemberData {
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

export default interface UserData extends MemberData, CreationData {
    points: Point[];
}
