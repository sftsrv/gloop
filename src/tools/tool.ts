import type { SVGTemplateResult, TemplateResult } from "lit";
import { Listenable } from "../controllers/listener";
import type { Trace, Traces } from "../controllers/controller.types";

export type SVGToolEventMap = {
  createElement: (parent: SVGElement) => SVGTemplateResult | undefined;
};

export abstract class SVGTool extends Listenable<SVGToolEventMap> {
  onTraceStart(_trace: Trace): void {}
  onTraceEnd(_trace: Trace): void {}

  abstract render(
    parent: SVGElement,
    traces: Traces,
  ): SVGTemplateResult | undefined;

  abstract renderTools(): TemplateResult;
}
