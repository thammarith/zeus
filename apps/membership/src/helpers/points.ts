import { User } from 'firebase/auth';
import { doc } from 'firebase/firestore';

import { Point } from '../types/Point';
import MemberData, { MemberPoint } from '../types/UserData';
import { firestore } from '../libs/firebase';
import { USERS } from '../constants/collections';
import { EVENT_PREFIX } from '../constants/points';
import { upsertUser } from './userData';

const buildPoints = (sourcePrefix: string, sourceId: string, points: Point, awardedBy: string): MemberPoint => ({
    ...points,
    awardedBy,
    awardedAt: new Date(),
    sourceId: `${sourcePrefix}-${sourceId}`,
});

export const awardPoints =
    (sourcePrefix: string) =>
    (sourceId: string) =>
    (memberData: MemberData, points: Point, awardedBy: string) => {
        const newPoints = [...memberData.points, buildPoints(sourcePrefix, sourceId, points, awardedBy)];

        const upsertingData = {
            ...memberData,
            points: newPoints,
        };

        console.log('upsertingData', upsertingData)

        return upsertUser(memberData.userId, upsertingData);
    };

export const awardEventPoints = awardPoints(EVENT_PREFIX);
