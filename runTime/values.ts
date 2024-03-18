export type ValueTypes = "null" | "number" | "boolean" | "object";

export interface RuntimeVal {
  type: ValueTypes;
}

export interface NullVal extends RuntimeVal {
  type: "null";
  value: null;
}

export interface NumberVal extends RuntimeVal {
  type: "number";
  value: number;
}

export interface BooleanVal extends RuntimeVal {
  type: "boolean";
  value: boolean;
}

export interface ObjectVal extends RuntimeVal {
  type: "object";
  properties: Map<string, RuntimeVal>;
}

export function NEW_NUM(n = 0) {
  return { type: "number", value: n } as NumberVal;
}

export function NEW_NULL() {
  return { type: "null", value: null } as NullVal;
}

export function NEW_BOOL(b = true) {
  return { type: "boolean", value: b } as BooleanVal;
}
