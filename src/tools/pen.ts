import { type SVGTemplateResult } from "lit";
import { path, toSVGPosition } from "../svg";
import { SVGTool } from "./tool";
import { type PagePosition } from "../conversions";
import getStroke, { type StrokeOptions, type Vec2 } from "perfect-freehand";
import type { Trace, TraceID, Traces } from "../controllers/controller.types";

/**
 * Turn the points returned from perfect-freehand into SVG path data.
 *
 * From https://codesandbox.io/p/sandbox/perfect-freehand-example-biwyi
 */
export function getSvgPathFromStroke(stroke: Vec2[]) {
  const first = stroke[0];
  if (!first) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const curr = arr[(i + 1) % arr.length];
      if (!curr) {
        return acc;
      }

      const [x1, y1] = curr;
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...first, "Q"],
  );

  d.push("Z");
  return d.join(" ");
}

/**
 * Options based on `perfect-freehand`. You can play around with options on
 * [the demo site](https://www.perfectfreehand.com/)
 */
type PenOptions = {
  stroke?: StrokeOptions;
  fill?: string;
};

/**
 * Pen implementation using `perfect-freehand`
 */
export class Pen extends SVGTool {
  private readonly options: PenOptions;

  constructor(options: PenOptions = {}) {
    super();

    this.options = options;
  }

  private activeTrace?: TraceID;

  setFillColor(color: string) {
    this.options.fill = color;
  }

  onTraceStart(trace: Trace) {
    if (this.activeTrace) {
      this.activeTrace = undefined;
      return;
    }

    this.activeTrace = trace.id;
  }

  onTraceEnd(trace: Trace) {
    if (this.activeTrace !== trace.id) {
      return;
    }

    this.emit("createElement", (parent) =>
      this.renderTrace(parent, trace.positions),
    );

    this.activeTrace = undefined;
  }

  private renderTrace = (parent: SVGElement, trace: PagePosition[]) => {
    const points = trace.map((p) => toSVGPosition(parent, p));

    const stroke = getStroke(points, this.options.stroke);
    const d = getSvgPathFromStroke(stroke);

    return path({ d, fill: this.options.fill });
  };

  render(parent: SVGElement, traces: Traces): SVGTemplateResult | undefined {
    const activeTrace = this.activeTrace;

    if (!(activeTrace && traces[activeTrace])) {
      return undefined;
    }

    const trace = traces[activeTrace];

    return this.renderTrace(parent, trace);
  }
}
