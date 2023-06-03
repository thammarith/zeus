import { collection, getDocs } from 'firebase/firestore';

import { firestore } from '../libs/firebase';
import { Event } from '../types/Event';
import { Logger } from '../utils/logger';
import { EVENTS } from '../constants/collections';
import { transformFirestoreDate } from './date';

const ß = Logger.build('userData');

export const getAllEvents = (): Promise<Event[]> => {
    Logger.log(ß('getting all the event datas'));

    return getDocs(collection(firestore, EVENTS))
        .then((docData) => {
            Logger.log(ß('received the data'));
            return docData.docs
                .map((doc) => doc.data())
                .map((d) => ({
                    ...d,
                    startAt: transformFirestoreDate(d.startAt),
                    endAt: transformFirestoreDate(d.endAt),
                }))
                .sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
        })
        .catch((err) => {
            Logger.error(ß('getAllEventDatas cannot get the data'), err);
            return err;
        });
};
