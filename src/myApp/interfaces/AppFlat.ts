import type { Timestamp } from "firebase/firestore";

export interface AppFlat {
    uid: string;
    src: string;
    name: string;
    city: string;
    streetName: string;
    streetNumber: string;
    areaSize: number;
    hasAC: boolean;
    yearBuilt: number;
    rentPrice: number;
    dateAvailable: Timestamp;
    creatorUid: string;
    isFavorite?: boolean; 
}