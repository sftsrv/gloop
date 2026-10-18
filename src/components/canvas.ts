import { LitElement, css, html, type SVGTemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { CursorController } from "../controllers/cursor-controller";

import { type ActionStackActions } from "../controllers/action-stack-controller";
import type { SVGTool } from "../tools/tool";
import type {
  ZoomEvent,
  Trace,
  PanEvent,
} from "../controllers/controller.types";
import { getViewBox, getNewCenter, toSVGPosition, type ViewBox } from "../svg";
import { make, clamp } from "../conversions";
import { PanZoomController } from "../controllers/panzoom-controller";
import { ifDefined } from "lit/directives/if-defined.js";

@customElement("x-canvas")
export class CanvasElement extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      height: 100%;
      display: flex;

      touch-action: manipulation;

      > svg {
        flex: 1;
        background-color: white;
      }
    }
  `;

  @property({ attribute: false })
  actions!: ActionStackActions<SVGTemplateResult>;

  @property({ attribute: false })
  renderedChildren!: SVGTemplateResult[];

  @property({ attribute: false })
  tools: Record<string, SVGTool> = {};

  @query("svg")
  readonly svgElement!: SVGElement;

  @property({ type: Number, reflect: true })
  scale: number = 1;

  @property({ type: Number, reflect: true })
  cx: number = 0;

  @property({ type: Number, reflect: true })
  cy: number = 0;

  @property({ type: Number, reflect: true })
  maxScale: number = 5;

  @property({ type: Number, reflect: true })
  minScale: number = 0.2;

  @property({ type: Boolean, attribute: true })
  preventScale = false;

  @property({ type: Boolean, attribute: true })
  preventMove = false;

  @state()
  private activeToolKey?: keyof typeof this.tools;

  @property()
  set tool(tool: string | undefined) {
    this.setActiveTool(tool);
  }

  get tool() {
    return this.activeToolKey;
  }

  private onZoom = (ev: ZoomEvent) => {
    const newScale = clamp(
      [this.minScale, this.maxScale],
      this.scale / (1 + ev.dz),
    );

    if (newScale == this.scale) {
      return;
    }

    this.scale = newScale;

    const c = getNewCenter(
      this.svgElement.getBoundingClientRect(),
      this.getViewBox(),
      toSVGPosition(this.svgElement, ev.center),
      1 + ev.dz,
      1 + ev.dz,
    );

    this.setCenter(c.x, c.y);
  };

  private onPan = (ev: PanEvent) => {
    const cx = this.cx + ev.delta.dx / this.scale;
    const cy = this.cy + ev.delta.dy / this.scale;

    this.setCenter(cx, cy);
  };

  private setCenter(cx: number, cy: number) {
    // TODO: Figure out canvas clamping such that it works well
    // with zooming and translation
    this.cx = cx;
    this.cy = cy;
  }

  constructor() {
    super();

    new PanZoomController(this)
      .addListener("pan", this.onPan)
      .addListener("zoom", this.onZoom);
  }

  protected firstUpdated(): void {
    this.setActiveTool(this.tool);
  }

  private setActiveTool(tool?: string) {
    if (this.activeToolKey) {
      this.tools[this.activeToolKey]?.removeListener(
        "createElement",
        this.onCreateElement,
      );
    }

    this.activeToolKey = tool as typeof this.activeToolKey;
    if (this.activeToolKey) {
      this.tools[this.activeToolKey]?.addListener(
        "createElement",
        this.onCreateElement,
      );
    }
  }

  private activeTool() {
    const key = this.activeToolKey;
    if (!key) {
      return undefined;
    }

    return this.tools[key];
  }

  private onCreateElement = (
    render: (parent: SVGElement) => SVGTemplateResult | undefined,
  ) => {
    const result = render(this.svgElement);
    if (result) {
      this.actions.push(result);
    }
  };

  private onTraceStart = (trace: Trace) => {
    this.activeTool()?.onTraceStart(trace);
  };

  private onTraceEnd = (trace: Trace) => {
    this.activeTool()?.onTraceEnd(trace);
  };

  private getViewBox = (): ViewBox => {
    return {
      center: make({
        x: this.cx,
        y: this.cy,
      }),
      scaleX: this.scale,
      scaleY: this.scale,
    };
  };

  private readonly cursor = new CursorController(this)
    .addListener("traceStart", this.onTraceStart)
    .addListener("traceEnd", this.onTraceEnd);

  render() {
    const tool =
      this.svgElement &&
      this.activeTool()?.render(this.svgElement, this.cursor.getTraces());

    const viewBox =
      this.svgElement &&
      getViewBox(this.svgElement.getBoundingClientRect(), this.getViewBox());

    return html`<svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox=${ifDefined(viewBox)}
    >
      ${this.renderedChildren} ${tool}
    </svg> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-canvas": CanvasElement;
  }
}
