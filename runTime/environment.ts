import { RuntimeVal } from "./values.ts";

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
    if(constant){
      this.constants.add(varname);
    }
    return value;
  }

  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);
    if(env.constants.has(varname)){
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
    if (this.parent == undefined) throw `${varname}, does not exit`;
    return this.parent.resolve(varname);
  }
}
