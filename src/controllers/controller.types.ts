import type { PagePosition, Delta } from "../conversions";

export const mouseTraceId = "mouse-trace";

type MouseIdentifier = typeof mouseTraceId;
type TouchIdentifier = Touch["identifier"];

export type TraceID = MouseIdentifier | TouchIdentifier;

export type Traces = Partial<Record<TraceID, PagePosition[]>>;
export type Trace = {
  id: TraceID;
  positions: PagePosition[];
};

export type CursorEventMap = {
  traceStart: Trace;
  traceEnd: Trace;
  traceMove: Trace;
};

export type ZoomEvent = {
  center: PagePosition;
  dz: number;
};

export type PanEvent = {
  center: PagePosition;
  delta: Delta;
};

export type PanZoomEventMap = {
  pan: PanEvent;
  zoom: ZoomEvent;
};

export type PanZoomOptions = {
  zoomScale: number;
  panScale: number;
};
