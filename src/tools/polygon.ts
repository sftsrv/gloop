import { html, type SVGTemplateResult } from "lit";
import { path, pointsToPath, toSVGPosition, type PathConfig } from "../svg";
import { SVGTool } from "./tool";
import { type PagePosition } from "../conversions";

import type { Trace, TraceID, Traces } from "../controllers/controller.types";

type PolygonOptions = Omit<PathConfig, "d"> & {
  close?: boolean;
};

export class Polygon extends SVGTool {
  private options: PolygonOptions;

  constructor(
    options: PolygonOptions = {
      close: true,
      fill: "transparent",
      stroke: "black",
    },
  ) {
    super();
    this.options = options;
  }

  private activeTrace?: TraceID;

  onTraceStart(trace: Trace) {
    if (this.activeTrace) {
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

  private renderTrace(parent: SVGElement, trace: PagePosition[]) {
    const points = trace.map((p) => toSVGPosition(parent, p));

    const d = pointsToPath(points, this.options.close);

    return path({ ...this.options, d });
  }

  render(parent: SVGElement, traces: Traces): SVGTemplateResult | undefined {
    const activeTrace = this.activeTrace;

    if (!(activeTrace && traces[activeTrace])) {
      return undefined;
    }

    const trace = traces[activeTrace];

    return this.renderTrace(parent, trace);
  }

  renderTools() {
    return html`
      <label>
        Fill
        <input
          type="color"
          value=${this.options.fill || ""}
          @change=${(e: InputEvent) =>
            (this.options.stroke = (e.target as HTMLInputElement).value)}
        />
      </label>

      <label>
        Fill
        <input
          type="color"
          value=${this.options.fill || ""}
          @change=${(e: InputEvent) =>
            (this.options.fill = (e.target as HTMLInputElement).value)}
        />
      </label>
    `;
  }
}
