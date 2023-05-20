export const setSessionItem = (key: string, value: string) => sessionStorage.setItem(key, value);
export const getSessionItem = (key: string) => sessionStorage.getItem(key);
export const removeSessionItem = (key: string) => sessionStorage.removeItem(key);
