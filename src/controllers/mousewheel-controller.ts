import type { ReactiveController, LitElement } from "lit";
import { Listenable } from "./listener";
import type {
  ZoomEvent,
  PanZoomEventMap,
  PanEvent,
  PanZoomOptions,
} from "./controller.types";
import { getFullModifier } from "./keybinding";
import { make, scaleDelta } from "../conversions";

export class MouseWheelController
  extends Listenable<PanZoomEventMap>
  implements ReactiveController
{
  private readonly host: LitElement;

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
  }

  hostConnected(): void {
    this.host.addEventListener("wheel", this.onWheel);
  }

  hostDisconnected(): void {
    this.host.removeEventListener("wheel", this.onWheel);
  }

  private onWheel = (ev: WheelEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    const modifier = getFullModifier(ev);

    switch (modifier) {
      case "<c>":
        const dz = (ev.deltaX + ev.deltaY) / 2;
        const zoomEvent: ZoomEvent = {
          dz: dz * this.zoomScale,
          center: make({
            x: ev.clientX,
            y: ev.clientY,
          }),
        };

        this.emit("zoom", zoomEvent);
        break;

      case "<shift>":
      case undefined:
        const panEvent: PanEvent = {
          delta: scaleDelta(this.panScale, {
            dx: ev.deltaX,
            dy: ev.deltaY,
          }),
          center: make({
            x: ev.clientX,
            y: ev.clientY,
          }),
        };
        this.emit("pan", panEvent);
        break;
    }

    this.host.requestUpdate();
  };
}
