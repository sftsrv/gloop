import { type Brand, make } from "./conversions";

export type RandomId = Brand<"random-id", string>;

export type Ref<T> = {
  id: RandomId;
  value: T;
};

function randomId(): RandomId {
  return make(Math.random().toString());
}

export function id<T>(value: Ref<T>): RandomId {
  return value.id;
}

export function ref<T>(value: T): Ref<T> {
  return {
    id: randomId(),
    value,
  };
}
