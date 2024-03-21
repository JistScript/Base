import Environment from "./environment.ts";
import { Statement } from "../base/typeAst.ts";
export type ValueTypes =
  | "null"
  | "number"
  | "boolean"
  | "object"
  | "native-fn"
  | "function"
  | "string"
  | "array";

export interface RuntimeVal {
  type: ValueTypes;
}

export class StringValue implements RuntimeVal {
  type: "string" = "string";
  value: string;
  constructor(value: string) {
    this.value = value;
  }
}
export interface ArrayVal extends RuntimeVal {
  type: "array";
  elements: RuntimeVal[];
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

export type FunctionCall = (args: RuntimeVal[], env: Environment) => RuntimeVal;
export interface NativeFnVal extends RuntimeVal {
  type: "native-fn";
  call: FunctionCall;
}

export interface FunctionVal extends RuntimeVal {
  type: "function";
  name: string;
  parameters: string[];
  declarationEnv: Environment;
  body: Statement[];
}

export function NATIVE_FN(call: FunctionCall) {
  return { type: "native-fn", call } as NativeFnVal;
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
