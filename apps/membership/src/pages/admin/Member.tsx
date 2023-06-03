import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { getAllMemberDatas, getMemberData } from '../../helpers/userData';
import MemberData from '../../types/UserData';
import { Event } from '../../types/Event';
import { getAllEvents } from '../../helpers/eventData';
import { format_TH_DDMMYYY } from '../../helpers/date';
import { EVENT_PREFIX, addPrefix } from '../../constants/points';
import { awardEventPoints } from '../../helpers/points';
import { useAuth } from '../../contexts/AuthContext';
import { Logger } from '../../utils/logger';

const QrReader = () => {};

const Member: React.FC = () => {
    const auth = useAuth();

    const videoRef = useRef<HTMLVideoElement>(null);

    const [userId, setUserId] = useState('');
    const [memberData, setMemberData] = useState<MemberData>();
    const [events, setEvents] = useState<Event[]>();
    const [selectedEvent, setSelectedEvent] = useState<Event>();

    useEffect(() => {
        if (!videoRef?.current) return;

        const qrScanner = new QrScanner(
            videoRef?.current,
            (result) => {
                setUserId(result.data);
            },
            {
                highlightScanRegion: true,
                highlightCodeOutline: true,
            }
        );

        qrScanner.start();

        return () => {
            qrScanner.stop();
            qrScanner.destroy();
        };
    });

    useEffect(() => {
        getAllEvents().then(setEvents);
    }, []);

    useEffect(() => {
        if (!userId) return;

        getMemberData(userId).then(setMemberData);

        // getAllMemberDatas().then((memberDatas) => {
        //     console.log(memberDatas);
        // });
    }, [userId]);

    const SelectedEvent = selectedEvent && (
        <div className="mt-4">
            <strong>{selectedEvent.name}</strong> ({selectedEvent.id})
            <div>
                {format_TH_DDMMYYY(selectedEvent.startAt)}&ndash;{format_TH_DDMMYYY(selectedEvent.endAt)}
            </div>
            <p>{selectedEvent.description}</p>
            <strong>{selectedEvent.points.points} แต้ม</strong> ({selectedEvent.points.basePoints}×
            {selectedEvent.points.multiplier} เท่า )
        </div>
    );

    const checkIfPointAwarded = (event: Event): boolean => {
        if (!memberData?.points) return false;

        return (
            memberData.points.find((p) => {
                console.log(p.sourceId, addPrefix(EVENT_PREFIX, event.id));
                return p.sourceId === addPrefix(EVENT_PREFIX, event.id);
            }) !== undefined
        );
    };

    const givePoints = () => {
        if (!selectedEvent || !memberData || !auth?.user) return;

        awardEventPoints(selectedEvent.id)(memberData, selectedEvent.points, auth?.user?.uid).then(() => {
            Logger.log('Points awarded');
        });
    };

    return (
        <>
            <section>Main</section>
            {!userId && (
                <section className="p-8">
                    <div className="aspect-square w-full rounded-md overflow-hidden">
                        {/* <div className="block w-full h-full object-cover bg-neutral-500"></div> */}
                        <video className="block w-full h-full object-cover" ref={videoRef}></video>
                    </div>
                </section>
            )}
            <section className="mt-8">
                <h2>
                    {memberData?.firstName} {memberData?.lastName}
                </h2>
            </section>
            <section className="mt-8">
                <select
                    defaultValue="default"
                    onChange={(ev) => setSelectedEvent(events?.find((e) => e.id === ev.currentTarget.value))}
                >
                    <option key="default" value="default" disabled>
                        เลือกกิจกรรมที่ผู้ใช้นี้เข้าร่วม
                    </option>
                    {events?.map((e) => (
                        <option key={e.id} value={e.id} disabled={checkIfPointAwarded(e)}>
                            {e.name} ({format_TH_DDMMYYY(e.startAt)}) {checkIfPointAwarded(e) && '(ได้รับแล้ว)'}
                        </option>
                    ))}
                </select>
                {SelectedEvent}
                {selectedEvent && (
                    <button className="mt-4" onClick={givePoints}>
                        เพิ่มคะแนน
                    </button>
                )}
            </section>
        </>
    );
};

export default Member;
