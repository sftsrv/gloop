import type { LitElement } from "lit";
import { TouchController } from "./touch-controller";
import { ClickController } from "./click-controller";
import {
  mouseTraceId,
  type CursorEventMap,
  type Traces,
} from "./controller.types";
import type { IListenable, Listener } from "./listener";
import { make, type PagePosition } from "../conversions";

export class CursorController implements IListenable<CursorEventMap> {
  private readonly click: ClickController;
  private readonly touch: TouchController;

  constructor(host: LitElement) {
    this.click = new ClickController(host);
    this.touch = new TouchController(host);
  }

  addListener<K extends keyof CursorEventMap>(
    event: K,
    listener: Listener<CursorEventMap[K]>,
  ) {
    this.click.addListener(event, listener);
    this.touch.addListener(event, listener);

    return this;
  }

  removeListener<K extends keyof CursorEventMap>(
    event: K,
    listener: Listener<CursorEventMap[K]>,
  ) {
    this.click.removeListener(event, listener);
    this.touch.removeListener(event, listener);

    return this;
  }

  getTraces(): Traces {
    return make({
      ...this.touch.traces,
      [mouseTraceId]: this.click.trace,
    });
  }

  getPresses() {
    const presses: PagePosition[] = [];

    if (this.click.position) {
      presses.push(this.click.position);
    }

    presses.push(...this.touch.touches);

    return presses;
  }
}
