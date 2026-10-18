import { type ReactiveControllerHost } from "lit";

export interface ActionStackActions<T> {
  push(action: T): void;
  undo(): T | undefined;
  redo(): T | undefined;
}

export class ActionStackController<T> implements ActionStackActions<T> {
  private readonly host: ReactiveControllerHost;

  private nextIndex: number;
  private stack: T[];

  constructor(host: ReactiveControllerHost, init: T[] = []) {
    this.host = host;
    this.stack = init;
    this.nextIndex = init.length;
  }

  get() {
    return this.stack.slice(0, this.nextIndex);
  }

  push(action: T) {
    this.stack = [...this.stack.slice(0, this.nextIndex), action];
    this.nextIndex = this.stack.length;

    this.host.requestUpdate();
  }

  undo(): T | undefined {
    this.nextIndex = Math.max(this.nextIndex - 1, 0);

    this.host.requestUpdate();

    return this.stack[this.nextIndex];
  }

  redo(): T | undefined {
    this.nextIndex = Math.min(this.nextIndex + 1, this.stack.length);

    this.host.requestUpdate();

    return this.stack[this.nextIndex];
  }
}
