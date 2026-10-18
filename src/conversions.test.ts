import { describe, expect, test } from "vitest";

import { type Range, clamp, scaleLinear } from "./conversions";

describe(scaleLinear, () => {
  test("interpolates between two identical ranges", () => {
    const x = scaleLinear([0, 1], [0, 1], 0.7);
    expect(x).toBe(0.7);
  });

  test("extrapolates between two identical ranges", () => {
    const x = scaleLinear([0, 1], [0, 1], 2);
    expect(x).toBe(2);
  });

  test("interpolates between two different ranges", () => {
    const x = scaleLinear([0, 1], [-100, 100], 0.7);
    expect(x).toBe(40);
  });

  test("extrapolates between two different ranges", () => {
    const x = scaleLinear([0, 1], [0, 2], 2);
    expect(x).toBe(4);
  });

  test("interpolates between two translated ranges", () => {
    const x = scaleLinear([-1, 1], [0, 2], 0.7);
    expect(x).toBe(1.7);
  });

  test("extrapolates between two translated ranges", () => {
    const x = scaleLinear([-1, 1], [0, 2], -2);
    expect(x).toBe(-1);
  });
});

describe(clamp, () => {
  const range: Range = [-10, 10];
  test.each([
    [0, 0],
    [-11, -10],
    [11, 10],
  ] as [number, number][])("minMax(%d) === (%d)", (value, expected) => {
    const result = clamp(range, value);

    expect(result).toBe(expected);
  });
});
