import { describe, test, expect } from "vitest";
import {
  getFullModifier,
  type ModifiedEvent,
  type FullModifier,
} from "./keybinding";

describe(getFullModifier, () => {
  test.each([
    [
      undefined,
      { altKey: false, ctrlKey: false, metaKey: false, shiftKey: false },
    ],
    [
      "<shift>",
      { altKey: false, ctrlKey: false, metaKey: false, shiftKey: true },
    ],
    ["<a>", { altKey: true, ctrlKey: false, metaKey: false, shiftKey: false }],
    [
      "<a><shift>",
      { altKey: true, ctrlKey: false, metaKey: false, shiftKey: true },
    ],
    ["<c>", { altKey: false, ctrlKey: false, metaKey: true, shiftKey: false }],
    [
      "<c><shift>",
      { altKey: false, ctrlKey: false, metaKey: true, shiftKey: true },
    ],
    ["<c>", { altKey: false, ctrlKey: true, metaKey: false, shiftKey: false }],
    [
      "<c><shift>",
      { altKey: false, ctrlKey: true, metaKey: false, shiftKey: true },
    ],
    ["<c>", { altKey: false, ctrlKey: true, metaKey: true, shiftKey: false }],
    [
      "<c><shift>",
      { altKey: false, ctrlKey: true, metaKey: true, shiftKey: true },
    ],
    ["<ac>", { altKey: true, ctrlKey: false, metaKey: true, shiftKey: false }],
    [
      "<ac><shift>",
      { altKey: true, ctrlKey: false, metaKey: true, shiftKey: true },
    ],
    ["<ac>", { altKey: true, ctrlKey: false, metaKey: true, shiftKey: false }],
    [
      "<ac><shift>",
      { altKey: true, ctrlKey: false, metaKey: true, shiftKey: true },
    ],
    ["<ac>", { altKey: true, ctrlKey: true, metaKey: true, shiftKey: false }],
    [
      "<ac><shift>",
      { altKey: true, ctrlKey: true, metaKey: true, shiftKey: true },
    ],
  ] satisfies [FullModifier | undefined, ModifiedEvent][])(
    "parses full modifier from event %s ",
    (expected, ev) => {
      const modifier = getFullModifier(ev);
      expect(modifier).toBe(expected);
    },
  );
});
