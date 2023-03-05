import UserData from '../types/UserData';

export const mapToUserData = (userData: any): UserData => ({
    ...userData,
    createdAt: new Date(userData.createdAt.seconds * 1000),
    lastAccessAt: new Date(userData.lastAccessAt.seconds * 1000),
    lastModifiedAt: new Date(userData.lastModifiedAt.seconds * 1000),
});
