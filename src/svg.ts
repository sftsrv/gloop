import { svg, type SVGTemplateResult } from "lit";
import {
  getPositionRelativeToElement,
  make,
  scaleLinear,
  type ElementPosition,
  type PagePosition,
  type SVGPosition,
  average,
} from "./conversions";

export type PathConfig = {
  d: string;
  fill?: string;
  strokeWidth?: number;
  stroke?: string;
};

export function toSVGPosition(
  element: SVGElement,
  position: PagePosition,
): SVGPosition {
  const rect = element.getBoundingClientRect();

  const viewBox = element.getAttribute("viewBox");

  if (!viewBox) {
    return make({
      x: 0,
      y: 0,
    });
  }

  const vb = parseViewBox(rect, viewBox);

  if (!vb) {
    return make({
      x: 0,
      y: 0,
    });
  }

  const elemRelative = getPositionRelativeToElement(element, position);

  return applyViewBoxToPosition(rect, vb, elemRelative);
}

export function pointsToPath(points: SVGPosition[], close = false) {
  if (points.length < 1) {
    return "";
  }

  const [first, ...rest] = points;

  const start = `M${first?.x} ${first?.y}`;
  const end = close ? "Z" : "";

  const path = rest.map(({ x, y }) => `L ${x} ${y}`).join(" ");

  return `${start} ${path} ${end}`;
}

export function path({
  d,
  fill,
  stroke,
  strokeWidth,
}: PathConfig): SVGTemplateResult {
  return svg`
      <path d=${d} fill=${fill} stroke=${stroke} stroke-width=${strokeWidth}/>
  `;
}

type TextConfig = {
  position: SVGPosition;
  content: string;
};

export function text({ position, content }: TextConfig): SVGTemplateResult {
  return svg`<text x=${position.x} y=${position.y}>${content}</text>`;
}

type CircleConfig = {
  position: SVGPosition;
  r: number;
};

export function circle({ position, r }: CircleConfig): SVGTemplateResult {
  return svg`<circle cx=${position.x} cy=${position.y} r=${r} />`;
}

export type ViewBox = {
  center: SVGPosition;
  scaleX: number;
  scaleY: number;
};

export function getViewBox(rect: Rect, vb: ViewBox): string {
  const { x0, y0, width, height } = getViewboxRanges(rect, vb);

  return `${x0} ${y0} ${width} ${height}`;
}

type Rect = {
  width: number;
  height: number;
};

type ViewBoxRanges = {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  width: number;
  height: number;
};

export function getViewboxRanges(
  { height, width }: Rect,
  { center, scaleX, scaleY }: ViewBox,
): ViewBoxRanges {
  const { x: cx, y: cy } = center;

  const dw = width / scaleX;
  const minX = cx - dw / 2;

  const dh = height / scaleY;
  const minY = cy - dh / 2;

  return {
    height: dh,
    width: dw,
    x0: minX,
    y0: minY,
    x1: minX + dw,
    y1: minY + dh,
  };
}

export function parseViewBox(
  { width, height }: Rect,
  viewBox: string,
): ViewBox | undefined {
  const parts = viewBox.split(" ");
  if (parts.length < 4) {
    return undefined;
  }

  const [minX, minY, dw, dh] = parts.map((i) => parseFloat(i)) as [
    number,
    number,
    number,
    number,
  ];

  const scaleX = width / dw;
  const cx = minX + dw! / 2;

  const scaleY = height / dh;
  const cy = minY + dh! / 2;

  return {
    scaleX,
    scaleY,
    center: make({
      x: cx,
      y: cy,
    }),
  };
}

export function applyViewBoxToPosition(
  rect: Rect,
  viewBox: ViewBox,
  position: ElementPosition,
): SVGPosition {
  const sx0 = viewBox.center.x - rect.width / 2 / viewBox.scaleX;
  const sx1 = viewBox.center.x + rect.width / 2 / viewBox.scaleX;

  const px0 = 0;
  const px1 = rect.width;

  const sy0 = viewBox.center.y - rect.height / 2 / viewBox.scaleY;
  const sy1 = viewBox.center.y + rect.height / 2 / viewBox.scaleY;

  const py0 = 0;
  const py1 = rect.height;

  const x = scaleLinear([px0, px1], [sx0, sx1], position.x);
  const y = scaleLinear([py0, py1], [sy0, sy1], position.y);

  return make({
    x: x,
    y: y,
  });
}

/**
 * Gets the new center of a viewbox given the old viewbox and origin
 * to scale about
 * translate to new origin -> scale -> translate to old origin
 */
export function getNewCenter(
  rect: Rect,
  viewBox: ViewBox,
  origin: SVGPosition,
  scaleX: number,
  scaleY: number,
): SVGPosition {
  const vb = getViewboxRanges(rect, viewBox);

  const x0 = (vb.x0 - origin.x) * scaleX + origin.x;
  const x1 = (vb.x1 - origin.x) * scaleX + origin.x;

  const y0 = (vb.y0 - origin.y) * scaleY + origin.y;
  const y1 = (vb.y1 - origin.y) * scaleY + origin.y;

  const x = average(x0, x1);
  const y = average(y0, y1);

  return make({
    x,
    y,
  });
}
