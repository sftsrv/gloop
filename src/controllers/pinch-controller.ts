import type { ReactiveController, LitElement } from "lit";
import { Listenable } from "./listener";
import type {
  PanZoomEventMap,
  PanZoomOptions,
  Trace,
} from "./controller.types";
import { TouchController } from "./touch-controller";
import {
  make,
  midpoint,
  type PagePosition,
  delta,
  distance,
  scaleDelta,
} from "../conversions";

function getLastPosition(
  traces: TouchController["traces"],
  id?: Trace["id"],
): PagePosition | undefined {
  const trace = id && traces[id];

  if (!trace) {
    return undefined;
  }

  return trace[trace.length - 1];
}

function getLastMovement(
  traces: TouchController["traces"],
  id?: Trace["id"],
): [from: PagePosition, to: PagePosition] | undefined {
  const trace = id && traces[id];

  if (!trace) {
    return undefined;
  }

  const from = trace[trace.length - 2];
  const to = trace[trace.length - 1];

  if (!(from && to)) {
    return undefined;
  }

  return [from, to];
}

export class PinchController
  extends Listenable<PanZoomEventMap>
  implements ReactiveController
{
  private readonly host: LitElement;
  private readonly touchController: TouchController;
  private readonly zoomScale: number;
  private readonly panScale: number;

  constructor(
    host: LitElement,
    { zoomScale = 1, panScale = 1 }: Partial<PanZoomOptions> = {},
  ) {
    super();

    this.host = host;
    host.addController(this);

    this.zoomScale = zoomScale;
    this.panScale = panScale;
    this.touchController = new TouchController(host);
  }

  private traces: Trace["id"][] = [];
  private lastCenter?: PagePosition;

  private readonly onTraceEnd = () => {
    this.traces = [];
    this.lastCenter = undefined;
    this.host.requestUpdate();
  };

  private readonly onTraceMove = () => {
    if (this.traces.length < 2) {
      return;
    }

    const [id1, id2] = this.traces;
    const trace1 = getLastPosition(this.touchController.traces, id1);
    const trace2 = getLastPosition(this.touchController.traces, id2);

    if (!(trace1 && trace2)) {
      return;
    }

    const newCenter: PagePosition = make(midpoint(trace1, trace2));

    const lastCenter = this.lastCenter;
    this.lastCenter = newCenter;

    if (!lastCenter) {
      return;
    }

    this.emit("pan", {
      center: newCenter,
      delta: scaleDelta(this.panScale, delta(newCenter, lastCenter)),
    });

    const move1 = getLastMovement(this.touchController.traces, id1);
    const move2 = getLastMovement(this.touchController.traces, id2);

    if (move1 && move2) {
      const oldDistance = distance(move1[0], move2[0]);
      const newDistance = distance(move1[1], move2[1]);

      const scaled = newDistance / oldDistance;
      const dz = 1 - scaled;

      this.emit("zoom", {
        dz: dz * this.zoomScale,
        center: newCenter,
      });
    }

    this.host.requestUpdate();
  };

  private readonly onTraceStart = (trace: Trace) => {
    if (this.traces.length >= 2) {
      return;
    }

    this.traces.push(trace.id);
    this.host.requestUpdate();
  };

  hostConnected(): void {
    this.touchController.addListener("traceStart", this.onTraceStart);
    this.touchController.addListener("traceMove", this.onTraceMove);
    this.touchController.addListener("traceEnd", this.onTraceEnd);
  }

  hostDisconnected(): void {
    this.touchController.removeListener("traceStart", this.onTraceStart);
    this.touchController.removeListener("traceMove", this.onTraceMove);
    this.touchController.removeListener("traceEnd", this.onTraceEnd);
  }
}
