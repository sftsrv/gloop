declare const __brand__: unique symbol;

export type Brand<Name extends string, Type> = Type & {
  [__brand__]: Name;
};

type Unbrand<B> = Omit<B, typeof __brand__> & {};

type ScreenRelative<T> = Brand<"SCREEN", T>;
type PageRelative<T> = Brand<"PAGE", T>;
type SVGRelative<T> = Brand<"SVG", T>;
type ElementRelative<T> = Brand<"ELEMENT", T>;

export type Position = {
  x: number;
  y: number;
};

export type Delta = {
  dx: number;
  dy: number;
};

// It may be possible to make these transforms use DOMMatrix instead
// of being manually defined
export type SVGPosition = SVGRelative<Position>;
export type ElementPosition = ElementRelative<Position>;
export type ScreenPosition = ScreenRelative<Position>;
export type PagePosition = PageRelative<Position>;

export function make<B extends Brand<string, unknown>>(value: Unbrand<B>): B {
  return value as B;
}

export function getPositionRelativeToElement(
  element: Element,
  position: PagePosition,
): ElementPosition {
  const rect = element.getBoundingClientRect();

  const x = position.x - rect.x;
  const y = position.y - rect.y;

  return make({ x, y });
}

export type Range = [from: number, to: number];

export function scaleLinear([p0, p1]: Range, [s0, s1]: Range, px: number) {
  const sx = ((px - p0) / (p1 - p0)) * (s1 - s0) + s0;
  return sx;
}

export function clamp([min, max]: Range, value: number): number {
  return value < min ? min : value > max ? max : value;
}

export function midpoint(from: Position, to: Position) {
  return {
    x: (from.x + to.x) / 2,
    y: (from.y + to.y) / 2,
  };
}

export function average(...nums: number[]): number {
  if (!nums.length) {
    throw new Error(
      "Attempted to get the aeverage of an empty list of numbers",
    );
  }

  return nums.reduce((sum, curr) => sum + curr, 0) / nums.length;
}

export function delta(from: Position, to: Position): Delta {
  return {
    dx: to.x - from.x,
    dy: to.y - from.y,
  };
}

export function scaleDelta(scale: number, delta: Delta): Delta {
  return {
    dx: scale * delta.dx,
    dy: scale * delta.dy,
  };
}

export function distance(from: Position, to: Position): number {
  return Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
}
