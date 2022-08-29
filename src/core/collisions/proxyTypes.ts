import { CBody } from './body';
import { CCircle } from './circle';
import { CPolygon } from './polygon';

export type TShape = CBody & CCircle & CPolygon;
