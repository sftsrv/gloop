import type { ReactiveController, LitElement } from "lit";
import { type PagePosition, make } from "../conversions";
import { type CursorEventMap, mouseTraceId } from "./controller.types";
import { Listenable } from "./listener";

export class ClickController
  extends Listenable<CursorEventMap>
  implements ReactiveController
{
  private host: LitElement;
  private mouseDown: boolean = false;

  position?: PagePosition;
  trace: PagePosition[] = [];

  constructor(host: LitElement) {
    super();
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this.host.addEventListener("mousemove", this.onMouseMove);
    this.host.addEventListener("mousedown", this.onMouseDown);
    this.host.addEventListener("mouseup", this.onMouseUp);
  }

  hostDisconnected(): void {
    this.host.removeEventListener("mousemove", this.onMouseMove);
    this.host.removeEventListener("mousedown", this.onMouseDown);
    this.host.removeEventListener("mouseup", this.onMouseUp);
  }

  private onMouseMove = (ev: MouseEvent) => {
    if (!this.mouseDown) {
      return;
    }

    ev.stopPropagation();
    ev.preventDefault();

    const pos = make<PagePosition>({
      x: ev.clientX,
      y: ev.clientY,
    });

    this.position = pos;
    this.trace.push(pos);

    this.host.requestUpdate();
  };

  private onMouseDown = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    const pos = make<PagePosition>({
      x: ev.clientX,
      y: ev.clientY,
    });

    this.mouseDown = true;
    this.trace = [pos];

    this.emit("traceStart", {
      id: mouseTraceId,
      positions: this.trace,
    });

    this.host.requestUpdate();
  };

  private onMouseUp = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    this.emit("traceEnd", {
      id: mouseTraceId,
      positions: this.trace,
    });

    this.mouseDown = false;
    this.position = undefined;
    this.trace = [];

    this.host.requestUpdate();
  };
}
