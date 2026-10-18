import { type LitElement, type ReactiveController } from "lit";
import {
  type BindingHandler,
  type KeybindingHandlers,
  parseBinding,
  type Keybinding,
  type KeyboardEventHandler,
} from "./keybinding";

/**
 * To ensure scoping is handled correctly, key bindings are associated at the window level
 */
export class KeybindingController implements ReactiveController {
  private readonly host: LitElement;
  private readonly bindings: BindingHandler[];

  constructor(host: LitElement, bindings: KeybindingHandlers) {
    this.host = host;
    this.bindings = Object.entries(bindings).map(([b, h]) =>
      parseBinding(b as Keybinding, h as KeyboardEventHandler),
    );
    this.host.addController(this);
  }

  private handleKeydown = (ev: KeyboardEvent) => {
    const handler = this.bindings.find((b) => b.isBinding(ev));
    if (!handler) {
      return;
    }

    ev.stopPropagation();
    ev.preventDefault();
    handler.handle(ev);

    this.host.requestUpdate();
  };

  hostConnected(): void {
    window.addEventListener("keydown", this.handleKeydown);
  }

  hostDisconnected(): void {
    window.removeEventListener("keydown", this.handleKeydown);
  }
}
