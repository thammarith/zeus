import { Point } from "./Point";

interface Event {
    id: string; // Six-character Nano ID separated by a dash into two groups of three characters
    name: string;
    description?: string;
    location?: string;
    startAt: Date;
    endAt: Date;
    points: Point;
}
