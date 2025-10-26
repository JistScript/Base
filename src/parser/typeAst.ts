export type NodeType =
  | "Program"
  | "NumericLiteral"
  | "Identifier"
  | "BinaryExpr"
  | "CallExpr"
  | "UnaryExpr"
  | "Property"
  | "FunctionDeclaration"
  | "VarDeclaration"
  | "StringLiteral"
  | "BooleanLiteral"
  | "ArrayLiteral"
  | "ObjectLiteral"
  | "AssignmentExpr"
  | "ConditionalExpr"
  | "MemberExpr"
  | "LogicalExpr"
  | "ArrayExpression"
  | "ObjectExpression"
  | "ArrowFunctionExpression"
  | "ClassDeclaration"
  | "IfStatement"
  | "ForStatement"
  | "WhileStatement"
  | "SwitchStatement"
  | "BreakStatement"
  | "ContinueStatement"
  | "ReturnStatement"
  | "ThrowStatement"
  | "TryStatement"
  | "CatchClause"
  | "BlockStatement"
  | "ExpressionStatement"
  | "EmptyStatement"
  | "DebuggerStatement"
  | "ThisExpression"
  | "SuperExpression"
  | "NewExpression"
  | "FunctionExpression"
  | "AwaitExpression"
  | "YieldExpression"
  | "TemplateLiteral"
  | "TaggedTemplateExpression"
  | "TemplateElement"
  | "ImportDeclaration"
  | "ExportDeclaration"
  | "ImportSpecifier"
  | "ExportSpecifier"
  | "ImportDefaultSpecifier"
  | "ExportDefaultSpecifier"
  | "ImportNamespaceSpecifier"
  | "ExportNamespaceSpecifier"
  | "ImportExpression"
  | "MetaProperty"
  | "Directive"
  | "DirectiveLiteral"
  | "BigIntLiteral"
  | "StateHookCall"
  | "ArrayDestructuring"
  | "TypeAnnotation";

// statement //
export interface Statement {
  kind: NodeType;
}

export interface Program extends Statement {
  kind: "Program";
  body: Statement[];
}

export interface VarDeclaration extends Statement {
  kind: "VarDeclaration";
  constant: boolean;
  identifier: string;
  value?: Expression;
  destructuring?: ArrayDestructuring;
}

export interface ArrayDestructuring extends Statement {
  kind: "ArrayDestructuring";
  elements: Identifier[];
}

export interface FunctionDeclaration extends Statement {
  kind: "FunctionDeclaration";
  parameters: string[];
  name: string;
  body: Statement[];
}

export interface Expression extends Statement {}

export interface AssignmentExpr extends Expression {
  kind: "AssignmentExpr";
  assigne: Expression;
  value: Expression;
}

export interface BinaryExpr extends Expression {
  kind: "BinaryExpr";
  left: Expression;
  right: Expression;
  operator: string;
}

export interface CallExpr extends Expression {
  kind: "CallExpr";
  args: Expression[];
  caller: Expression;
  typeAnnotation?: TypeAnnotation;
}

export interface StateHookCall extends Expression {
  kind: "StateHookCall";
  hookName: string;
  typeAnnotation: TypeAnnotation;
  initialValue: Expression;
}

export interface TypeAnnotation extends Expression {
  kind: "TypeAnnotation";
  typeName: string;
  genericTypes?: TypeAnnotation[];
}

export interface MemberExpr extends Expression {
  kind: "MemberExpr";
  object: Expression;
  property: Expression;
  computed: boolean;
}

export interface Identifier extends Expression {
  kind: "Identifier";
  symbol: string;
}

export interface NumericLiteral extends Expression {
  kind: "NumericLiteral";
  value: number;
}

export interface Property extends Expression {
  kind: "Property";
  key: string;
  value?: Expression;
}

export interface ObjectLiteral extends Expression {
  kind: "ObjectLiteral";
  properties: Property[];
}

export interface StringLiteral extends Expression {
  kind: "StringLiteral";
  value: string;
}

export interface ArrayLiteral extends Expression {
  kind: "ArrayLiteral";
  elements: Expression[];
}

export interface UnaryExpr extends Expression {
  kind: "UnaryExpr";
  operator: string;
  argument: Expression;
}

export interface BooleanLiteral extends Expression {
  kind: "BooleanLiteral";
  value: boolean;
}

export interface ArrayExpression extends Expression {
  kind: "ArrayExpression";
  elements: Expression[];
}

export interface LogicalExpr extends Expression {
  kind: "LogicalExpr";
  left: Expression;
  right: Expression;
  operator: string;
}

export interface ConditionalExpr extends Expression {
  kind: "ConditionalExpr";
  test: Expression;
  consequent: Expression;
  alternate: Expression;
}

export interface ArrowFunctionExpression extends Expression {
  kind: "ArrowFunctionExpression";
  parameters: string[];
  body: Statement[];
}

export interface ClassDeclaration extends Statement {
  kind: "ClassDeclaration";
  name: string;
  superClass?: Expression;
  body: Statement[];
}

export interface IfStatement extends Statement {
  kind: "IfStatement";
  test: Expression;
  consequent: Statement[];
  alternate?: Statement[] | IfStatement;
}

export interface ForStatement extends Statement {
  kind: "ForStatement";
  init?: VarDeclaration | AssignmentExpr | Expression;
  test?: Expression;
  update?: AssignmentExpr;
  body: Statement[];
}

export interface WhileStatement extends Statement {
  kind: "WhileStatement";
  test: Expression;
  body: Statement[];
}

export interface SwitchStatement extends Statement {
  kind: "SwitchStatement";
  discriminant: Expression;
  cases: SwitchCase[];
}

export interface SwitchCase {
  kind: "SwitchCase";
  test?: Expression;
  consequent: Statement[];
}

export interface BreakStatement extends Statement {
  kind: "BreakStatement";
}

export interface ContinueStatement extends Statement {
  kind: "ContinueStatement";
}

export interface ReturnStatement extends Statement {
  kind: "ReturnStatement";
  argument?: Expression;
}

export interface ThrowStatement extends Statement {
  kind: "ThrowStatement";
  argument: Expression;
}

export interface TryStatement extends Statement {
  kind: "TryStatement";
  block: Statement[];
  handler?: CatchClause;
  finalizer?: Statement[];
}

export interface CatchClause {
  kind: "CatchClause";
  param: Identifier;
  body: Statement[];
}

export interface BlockStatement extends Statement {
  kind: "BlockStatement";
  body: Statement[];
}

export interface ExpressionStatement extends Statement {
  kind: "ExpressionStatement";
  expression: Expression;
}

export interface EmptyStatement extends Statement {
  kind: "EmptyStatement";
}

export interface DebuggerStatement extends Statement {
  kind: "DebuggerStatement";
}

export interface ThisExpression extends Expression {
  kind: "ThisExpression";
}

export interface SuperExpression extends Expression {
  kind: "SuperExpression";
}

export interface NewExpression extends Expression {
  kind: "NewExpression";
  callee: Expression;
  arguments: Expression[];
}

export interface FunctionExpression extends Expression {
  kind: "FunctionExpression";
  parameters: string[];
  body: Statement[];
}

export interface AwaitExpression extends Expression {
  kind: "AwaitExpression";
  argument: Expression;
}

export interface YieldExpression extends Expression {
  kind: "YieldExpression";
  argument?: Expression;
}

export interface TemplateLiteral extends Expression {
  kind: "TemplateLiteral";
  quasis: TemplateElement[];
  expressions: Expression[];
}

export interface TaggedTemplateExpression extends Expression {
  kind: "TaggedTemplateExpression";
  tag: Expression;
  quasi: TemplateLiteral;
}

export interface TemplateElement {
  kind: "TemplateElement";
  value: {
    raw: string;
    cooked: string;
  };
  tail: boolean;
}

export interface ImportDeclaration extends Statement {
  kind: "ImportDeclaration";
  specifiers: ImportSpecifier[] | ImportDefaultSpecifier[] | ImportNamespaceSpecifier[];
  source: StringLiteral;
}

export interface ExportDeclaration extends Statement {
  kind: "ExportDeclaration";
  declaration: Statement | null;
  specifiers: ExportSpecifier[] | ExportNamespaceSpecifier[] | ExportDefaultSpecifier[];
  source?: StringLiteral;
}

export interface ImportSpecifier {
  kind: "ImportSpecifier";
  local: Identifier;
  imported: Identifier;
}

export interface ExportSpecifier {
  kind: "ExportSpecifier";
  local: Identifier;
  exported: Identifier;
}

export interface ImportDefaultSpecifier {
  kind: "ImportDefaultSpecifier";
  local: Identifier;
}

export interface ExportDefaultSpecifier {
  kind: "ExportDefaultSpecifier";
  exported: Identifier;
}

export interface ImportNamespaceSpecifier {
  kind: "ImportNamespaceSpecifier";
  local: Identifier;
}

export interface ExportNamespaceSpecifier {
  kind: "ExportNamespaceSpecifier";
  exported: Identifier;
}

export interface ImportExpression extends Expression {
  kind: "ImportExpression";
  source: Expression;
}

export interface MetaProperty extends Expression {
  kind: "MetaProperty";
  meta: Identifier;
  property: Identifier;
}

export interface Directive extends Expression {
  kind: "Directive";
  value: DirectiveLiteral;
}

export interface DirectiveLiteral extends Expression {
  kind: "DirectiveLiteral";
  value: string;
}

export interface BigIntLiteral extends Expression {
  kind: "BigIntLiteral";
  value: bigint;
}
