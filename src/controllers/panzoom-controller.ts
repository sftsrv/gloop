import type { LitElement } from "lit";
import type { IListenable, Listener } from "./listener";
import { MouseWheelController } from "./mousewheel-controller";
import type { PanZoomEventMap } from "./controller.types";
import { PinchController } from "./pinch-controller";

export class PanZoomController implements IListenable<PanZoomEventMap> {
  private readonly mouseWheel: MouseWheelController;
  private readonly pinch: PinchController;

  constructor(host: LitElement) {
    this.mouseWheel = new MouseWheelController(host, {
      zoomScale: 1 / 100,
      panScale: 2,
    });

    this.pinch = new PinchController(host, {
      zoomScale: 1,
      panScale: 1,
    });
  }

  addListener<K extends keyof PanZoomEventMap>(
    event: K,
    listener: Listener<PanZoomEventMap[K]>,
  ) {
    this.mouseWheel.addListener(event, listener);
    this.pinch.addListener(event, listener);

    return this;
  }

  removeListener<K extends keyof PanZoomEventMap>(
    event: K,
    listener: Listener<PanZoomEventMap[K]>,
  ) {
    this.mouseWheel.removeListener(event, listener);
    this.pinch.removeListener(event, listener);

    return this;
  }
}
