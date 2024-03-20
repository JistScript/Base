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
  | "BigIntLiteralTypeAnnotation"
  | "BigIntLiteralTypeAnnotationTypeAnnotation"
  | "BigIntLiteralTypeAnnotationTypeAnnotationTypeAnnotation";

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
