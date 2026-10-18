import { type SVGTemplateResult, type TemplateResult, html, svg } from "lit";
import { toSVGPosition, text } from "../svg";
import { SVGTool } from "./tool";
import type { Traces } from "../controllers/controller.types";

export class Tracker extends SVGTool {
  render(parent: SVGElement, traces: Traces): SVGTemplateResult | undefined {
    const positions = Object.values(traces)
      .map((p) => p?.[p?.length - 1])
      .filter((p) => !!p)
      ?.map((p) => toSVGPosition(parent, p));

    const texts = positions?.map((p) =>
      text({
        position: p,
        content: `x=${Math.round(p.x)} y=${Math.round(p.y)}`,
      }),
    );

    return svg`${texts}`;
  }

  renderTools(): TemplateResult {
    return html``;
  }
}
