import {
  NATIVE_FN,
  NEW_BOOL,
  NEW_NULL,
  NEW_UNDEFINED,
  RuntimeVal,
  NEW_ARRAY,
  StateTypeInfo,
  validateStateType,
} from "./values.js";

// Global state counter for useState //
let stateIdCounter = 0;
const stateStore = new Map<number, RuntimeVal>();

export function createGlobalEnv() {
  const env = new Environment();

  // Constants //
  env.declareVar("null", NEW_NULL(), true);
  env.declareVar("true", NEW_BOOL(true), true);
  env.declareVar("false", NEW_BOOL(false), true);
  env.declareVar("undefined", NEW_UNDEFINED(), true);

  // native methods //
  env.declareVar(
    "mark",
    NATIVE_FN(args => {
      console.log(
        ...args.map(arg => {
          if (arg.type === "string") return (arg as any).value;
          if (arg.type === "number") return (arg as any).value;
          if (arg.type === "boolean") return (arg as any).value;
          if (arg.type === "array") {
            const arr = arg as any;
            return arr.elements.map((e: any) =>
              e.type === "string" || e.type === "number" || e.type === "boolean" ? e.value : e
            );
          }
          if (arg.type === "object") {
            const obj = arg as any;
            const result: any = {};
            obj.properties.forEach((val: any, key: string) => {
              result[key] =
                val.type === "string" || val.type === "number" || val.type === "boolean"
                  ? val.value
                  : val;
            });
            return result;
          }
          return arg;
        })
      );
      return NEW_NULL();
    }),
    true
  );

  // useState implementation //
  env.declareVar(
    "useState",
    NATIVE_FN(args => {
      if (args.length === 0) {
        throw "useState requires an initial value";
      }
      const initialValue = args[0];
      const typeInfo: StateTypeInfo | undefined = args[1] as any;
      if (typeInfo && !validateStateType(initialValue, typeInfo)) {
        console.warn(
          `[JistScript] Type mismatch in useState: expected ${typeInfo.typeName}, got ${initialValue.type}`
        );
      }
      const stateId = stateIdCounter++;
      if (!stateStore.has(stateId)) {
        stateStore.set(stateId, initialValue);
      }
      const currentValue = stateStore.get(stateId)!;
      // Create setter function //
      const setter = NATIVE_FN(setterArgs => {
        if (setterArgs.length === 0) {
          throw "State setter requires a new value";
        }
        const newValue = setterArgs[0];
        if (typeInfo && !validateStateType(newValue, typeInfo)) {
          console.warn(
            `[JistScript] Type mismatch in setState: expected ${typeInfo.typeName}, got ${newValue.type}`
          );
        }
        stateStore.set(stateId, newValue);
        return newValue;
      });
      return NEW_ARRAY([currentValue, setter]);
    }),
    true
  );

  return env;
}

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;
  private constants: Set<string>;

  constructor(parentENV?: Environment) {
    this.parent = parentENV;
    this.variables = new Map();
    this.constants = new Set();
  }

  public declareVar(varname: string, value: RuntimeVal, constant: boolean): RuntimeVal {
    if (this.variables.has(varname)) {
      throw `Not able to declare variable ${varname}, as its already defined`;
    }
    this.variables.set(varname, value);
    if (constant) {
      this.constants.add(varname);
    }
    return value;
  }

  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);
    if (env.constants.has(varname)) {
      throw `${varname}, cant be redeclared as it was a constant`;
    }
    env.variables.set(varname, value);
    return value;
  }

  public lookUpVar(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    return env.variables.get(varname) as RuntimeVal;
  }

  public resolve(varname: string): Environment {
    if (this.variables.has(varname)) return this;
    if (this.parent == undefined) throw `${varname}, does not exist`;
    return this.parent.resolve(varname);
  }
}

export function resetStateCounter() {
  stateIdCounter = 0;
  stateStore.clear();
}
