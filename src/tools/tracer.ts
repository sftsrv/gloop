import { type SVGTemplateResult, type TemplateResult, html, svg } from "lit";
import { toSVGPosition, circle } from "../svg";
import { SVGTool } from "./tool";
import type { Traces } from "../controllers/controller.types";

export class Tracer extends SVGTool {
  render(parent: SVGElement, traces: Traces): SVGTemplateResult {
    const positions = Object.entries(traces).flatMap(
      ([_, trace]) => trace?.map((p) => toSVGPosition(parent, p)) || [],
    );

    const circles = positions.map((p) =>
      circle({
        position: p,
        r: 2,
      }),
    );

    return svg`${circles}`;
  }

  renderTools(): TemplateResult {
    return html``;
  }
}
