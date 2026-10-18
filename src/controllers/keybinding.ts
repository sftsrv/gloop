/**
 * Use `C` for `cmd`, `ctrl`, and `meta` to avoid having to do platform specific stuff
 */
const modifiers = ["<a>", "<c>", "<ac>"] as const;
export type Modifier = (typeof modifiers)[number];
const shift = "<shift>" as const;
export type Shift = typeof shift;

export type FullModifier = Shift | Modifier | `${Modifier}${Shift}`;
type Numeric = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0";
type LowerAlpha =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";
/*
 * Add any additional key types here as needed
 */
type Key = LowerAlpha | Numeric;
const sep = "+";
type Sep = typeof sep;
export type Keybinding = Key | `${FullModifier}${Sep}${Key}`;
export type KeyboardEventHandler = (ev: KeyboardEvent) => void;

export type ModifiedEvent = Pick<
  KeyboardEvent,
  "ctrlKey" | "altKey" | "metaKey" | "shiftKey"
>;

export function getFullModifier({
  altKey,
  ctrlKey,
  metaKey,
  shiftKey,
}: ModifiedEvent): FullModifier | undefined {
  const hasC = ctrlKey || metaKey;
  const shifted = shiftKey ? "<shift>" : "";

  if (hasC && altKey) {
    return ("<ac>" + shifted) as FullModifier;
  }

  if (altKey) {
    return ("<a>" + shifted) as FullModifier;
  }

  if (hasC) {
    return ("<c>" + shifted) as FullModifier;
  }

  return shifted || undefined;
}

export function parseBinding(
  binding: Keybinding,
  handle: KeyboardEventHandler,
): BindingHandler {
  const parts = binding.split(sep);

  const expectedModifier = parts.find((p): p is FullModifier =>
    modifiers.includes(p as Modifier),
  );

  const hasShift = parts.includes(shift);

  const key = parts[parts.length - 1];

  return {
    handle,
    isBinding(ev) {
      const isKey = ev.key === key;
      if (!isKey) {
        return false;
      }

      if (!(expectedModifier || hasShift)) {
        return true;
      }

      const modifier = getFullModifier(ev);
      return modifier === expectedModifier;
    },
  };
}

export type BindingHandler = {
  isBinding: (ev: KeyboardEvent) => boolean;
  handle: KeyboardEventHandler;
};

export type KeybindingHandlers = Partial<
  Record<Keybinding, KeyboardEventHandler>
>;
