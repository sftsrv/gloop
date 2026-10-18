import { describe, expect, test } from "vitest";
import {
  applyViewBoxToPosition,
  getViewBox,
  parseViewBox,
  getNewCenter,
  type ViewBox,
} from "./svg";
import { make, type ElementPosition, type SVGPosition } from "./conversions";

const rect = {
  width: 100,
  height: 50,
};

describe("viewBox handling", () => {
  test("default viewbox", () => {
    const input: ViewBox = {
      scaleX: 1,
      scaleY: 1,
      center: make({
        x: 0,
        y: 0,
      }),
    };
    const vb = getViewBox(rect, input);

    expect(vb).toMatchInlineSnapshot(`"-50 -25 100 50"`);

    const parsed = parseViewBox(rect, vb);
    expect(parsed).toMatchObject(input);
  });

  test("zoomed out viewbox", () => {
    const input: ViewBox = {
      scaleX: 0.5,
      scaleY: 0.5,
      center: make({
        x: 0,
        y: 0,
      }),
    };
    const vb = getViewBox(rect, input);

    expect(vb).toMatchInlineSnapshot(`"-100 -50 200 100"`);
    const parsed = parseViewBox(rect, vb);
    expect(parsed).toMatchObject(input);
  });

  test("zoomed in viewbox", () => {
    const input: ViewBox = {
      scaleX: 2,
      scaleY: 2,
      center: make({
        x: 0,
        y: 0,
      }),
    };
    const vb = getViewBox(rect, input);

    expect(vb).toMatchInlineSnapshot(`"-25 -12.5 50 25"`);
    const parsed = parseViewBox(rect, vb);
    expect(parsed).toMatchObject(input);
  });

  test("different x and y scale", () => {
    const input: ViewBox = {
      scaleX: 2,
      scaleY: 0.5,
      center: make({
        x: 0,
        y: 0,
      }),
    };
    const vb = getViewBox(rect, input);

    expect(vb).toMatchInlineSnapshot(`"-25 -50 50 100"`);
    const parsed = parseViewBox(rect, vb);
    expect(parsed).toMatchObject(input);
  });

  test("translated viewbox", () => {
    const input: ViewBox = {
      scaleX: 1,
      scaleY: 1,
      center: make({
        x: 50,
        y: 50,
      }),
    };
    const vb = getViewBox(rect, input);

    expect(vb).toMatchInlineSnapshot(`"0 25 100 50"`);
    const parsed = parseViewBox(rect, vb);
    expect(parsed).toMatchObject(input);
  });

  test("translated and zoomed viewbox", () => {
    const input: ViewBox = {
      scaleX: 2,
      scaleY: 0.5,
      center: make({
        x: -5,
        y: 10,
      }),
    };
    const vb = getViewBox(rect, input);

    expect(vb).toMatchInlineSnapshot(`"-30 -40 50 100"`);
    const parsed = parseViewBox(rect, vb);
    expect(parsed).toMatchObject(input);
  });
});

describe(applyViewBoxToPosition, () => {
  test("applies start point correctly", () => {
    const vb: ViewBox = {
      scaleX: 1,
      scaleY: 1,
      center: make({
        x: 0,
        y: 0,
      }),
    };

    const pos: ElementPosition = make({
      x: 0,
      y: 0,
    });

    const result = applyViewBoxToPosition(rect, vb, pos);
    expect(result).toMatchInlineSnapshot(`
      {
        "x": -50,
        "y": -25,
      }
    `);
  });

  test("applies middle point correctly", () => {
    const vb: ViewBox = {
      scaleX: 1,
      scaleY: 1,
      center: make({
        x: 0,
        y: 0,
      }),
    };

    const pos: ElementPosition = make({
      x: rect.width / 2,
      y: rect.height / 2,
    });

    const result = applyViewBoxToPosition(rect, vb, pos);
    expect(result).toMatchInlineSnapshot(`
      {
        "x": 0,
        "y": 0,
      }
    `);
  });

  test("applies end point correctly", () => {
    const vb: ViewBox = {
      scaleX: 1,
      scaleY: 1,
      center: make({
        x: 0,
        y: 0,
      }),
    };

    const pos: ElementPosition = make({
      x: rect.width,
      y: rect.height,
    });

    const result = applyViewBoxToPosition(rect, vb, pos);
    expect(result).toMatchInlineSnapshot(`
      {
        "x": 50,
        "y": 25,
      }
    `);
  });

  describe(getNewCenter, () => {
    test("scales around origina as expected", () => {
      const vb: ViewBox = {
        scaleX: 2,
        scaleY: 0.5,
        center: make({
          x: -5,
          y: 10,
        }),
      };

      const origin: SVGPosition = make({
        x: 2,
        y: 5,
      });

      const result = getNewCenter(rect, vb, origin, 2, 3);

      expect(result).toMatchInlineSnapshot(`
        {
          "x": -12,
          "y": 20,
        }
      `);
    });
  });
});
