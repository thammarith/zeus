export const EVENT_PREFIX = 'EVT';
export const PURCHASE_PREFIX = 'PUR';
export const ADJUSTMENT_PREFIX = 'ADJ';
export const REFUND_PREFIX = 'RFD';
export const REFERRAL_PREFIX = 'REF';

export const addPrefix = (source: string, id: string) => `${source}-${id}`;
export const removePrefix = (source: string) => source.split('-').filter((_, i) => i > 0).join('-');
