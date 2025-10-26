import Environment from "./environment";
import { Statement } from "../parser/typeAst";

export type ValueTypes =
  | "null"
  | "number"
  | "boolean"
  | "object"
  | "native-fn"
  | "function"
  | "string"
  | "array"
  | "undefined"
  | "state-tuple";

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

// State management types //
export interface StateTypeInfo {
  typeName: string;
  elementType?: string;
}

export interface StateTuple extends RuntimeVal {
  type: "state-tuple";
  value: RuntimeVal;
  setter: FunctionVal;
  typeInfo?: StateTypeInfo;
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

export function NEW_UNDEFINED() {
  return { type: "undefined" } as RuntimeVal;
}

export function NEW_STRING(s = "") {
  return new StringValue(s);
}

export function NEW_ARRAY(elements: RuntimeVal[] = []) {
  return { type: "array", elements } as ArrayVal;
}

export function NEW_OBJECT(properties: Map<string, RuntimeVal> = new Map()) {
  return { type: "object", properties } as ObjectVal;
}

// Type validation helpers //
export function validateStateType(value: RuntimeVal, typeInfo: StateTypeInfo): boolean {
  switch (typeInfo.typeName) {
    case "String":
      return value.type === "string";
    case "Number":
      return value.type === "number";
    case "Boolean":
      return value.type === "boolean";
    case "Array":
      if (value.type !== "array") return false;
      if (typeInfo.elementType) {
        const arr = value as ArrayVal;
        return arr.elements.every(elem => {
          switch (typeInfo.elementType) {
            case "String":
              return elem.type === "string";
            case "Number":
              return elem.type === "number";
            case "Boolean":
              return elem.type === "boolean";
            default:
              return true;
          }
        });
      }
      return true;
    case "Object":
      return value.type === "object";
    default:
      return true;
  }
}
