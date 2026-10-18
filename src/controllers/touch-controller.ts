import type { ReactiveController, LitElement } from "lit";
import { type PagePosition, make } from "../conversions";
import type { CursorEventMap, Traces } from "./controller.types";
import { Listenable } from "./listener";

export class TouchController
  extends Listenable<CursorEventMap>
  implements ReactiveController
{
  private host: LitElement;

  touches: PagePosition[] = [];
  traces: Traces = {};

  touchCount() {
    return Object.keys(this.traces).length;
  }

  constructor(host: LitElement) {
    super();
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this.host.addEventListener("touchstart", this.onTouchStart);
    this.host.addEventListener("touchmove", this.onTouchMove);
    this.host.addEventListener("touchend", this.onTouchEnd);
    this.host.addEventListener("touchcancel", this.onTouchEnd);
  }

  hostDisconnected(): void {
    this.host.removeEventListener("touchstart", this.onTouchStart);
    this.host.removeEventListener("touchmove", this.onTouchMove);
    this.host.removeEventListener("touchend", this.onTouchEnd);
    this.host.removeEventListener("touchcancel", this.onTouchEnd);
  }

  private upsertTouches(ev: TouchEvent) {
    this.touches = Array.from(ev.touches).map((t) =>
      make({
        x: t.clientX,
        y: t.clientY,
      }),
    );

    for (const c of ev.changedTouches) {
      const pos = make<PagePosition>({ x: c.clientX, y: c.clientY });
      const existing = this.traces[c.identifier] || [];
      existing.push(pos);
      this.traces[c.identifier] = existing;
    }
  }

  private removeTouches(ev: TouchEvent) {
    this.touches = Array.from(ev.touches).map((t) =>
      make({
        x: t.clientX,
        y: t.clientY,
      }),
    );

    for (const c of ev.changedTouches) {
      delete this.traces[c.identifier];
    }
  }

  private onTouchStart = (ev: TouchEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    this.upsertTouches(ev);

    for (const { identifier } of ev.changedTouches) {
      this.emit("traceStart", {
        id: identifier,
        positions: this.traces[identifier] || [],
      });
    }

    this.host.requestUpdate();
  };

  private onTouchMove = (ev: TouchEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    for (const { identifier } of ev.changedTouches) {
      this.emit("traceMove", {
        id: identifier,
        positions: this.traces[identifier] || [],
      });
    }

    this.upsertTouches(ev);
    this.host.requestUpdate();
  };

  private onTouchEnd = (ev: TouchEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    for (const { identifier } of ev.changedTouches) {
      this.emit("traceEnd", {
        id: identifier,
        positions: this.traces[identifier] || [],
      });
    }

    this.removeTouches(ev);

    this.host.requestUpdate();
  };
}
