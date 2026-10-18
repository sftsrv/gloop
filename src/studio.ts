import { LitElement, type SVGTemplateResult, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./components/canvas";
import { ActionStackController } from "./controllers/action-stack-controller";
import { KeybindingController } from "./controllers/keybinding-controller";
import { Tracker } from "./tools/tracker";
import { Tracer } from "./tools/tracer";
import { Polygon } from "./tools/polygon";
import { Pen } from "./tools/pen";

@customElement("x-studio")
export class StudioElement extends LitElement {
  private readonly templateActions =
    new ActionStackController<SVGTemplateResult>(this, []);

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      box-sizing: border-box;
      padding: 1rem;
      width: 100dvw;
      height: 100dvh;

      > x-canvas {
        flex: 1;
      }
    }
  `;

  @state()
  private tool: keyof typeof this.tools = "pen";

  @state()
  private color: string = "black";

  private readonly tools = {
    tracker: new Tracker(),
    tracer: new Tracer(),
    polygon: new Polygon({
      fill: "transparent",
      stroke: this.color,
      strokeWidth: 4,
    }),
    pen: new Pen({
      fill: this.color,
      stroke: {
        size: 30,
        smoothing: 0.81,
        thinning: 0.92,
        streamline: 0.37,
        start: {
          taper: 54,
          cap: true,
        },
        end: {
          taper: true,
        },
      },
    }),
  };

  private setColor(color: string) {
    this.tools.pen.setFillColor(color);
    this.tools.polygon.setStrokeColor(color);
  }

  constructor() {
    super();
    new KeybindingController(this, {
      "<c>+z": () => this.templateActions.undo(),
      "<c><shift>+z": () => this.templateActions.redo(),
    });
  }

  render() {
    const tools = Object.keys(this.tools).map(
      (t) =>
        html`<option ?selected=${t === this.tool} value=${t}>${t}</option>`,
    );

    return html` <div>
        <button @click=${() => this.templateActions.undo()}>Undo</button>
        <button @click=${() => this.templateActions.redo()}>Redo</button>

        <select
          @change=${(e: InputEvent) => {
            this.tool = (e.target as HTMLSelectElement)
              .value as typeof this.tool;
          }}
          name="Tool"
        >
          ${tools}
        </select>
        <label>
          Color
          <input
            type="color"
            value=${this.color}
            @change=${(e: InputEvent) =>
              this.setColor((e.target as HTMLInputElement).value)}
          />
        </label>
      </div>
      <x-canvas
        tool=${this.tool}
        .tools=${this.tools}
        .actions=${this.templateActions}
        .renderedChildren=${this.templateActions.get()}
      ></x-canvas>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-studio": StudioElement;
  }
}
