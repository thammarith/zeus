import { Timestamp } from "firebase/firestore";

type FormatOption = Intl.DateTimeFormatOptions;

const THAI = 'th-th';

const DD_MM_YY: FormatOption = { day: 'numeric', month: 'narrow', year: '2-digit' };

const formatDate = (locale: string) => (options: Intl.DateTimeFormatOptions) => (date: Date) =>
    new Intl.DateTimeFormat(locale, options).format(date);

const formatToThai = formatDate(THAI);

export const format_TH_DDMMYYY = formatToThai(DD_MM_YY);

export const transformFirestoreDate = (date: Timestamp) => date.toDate();
