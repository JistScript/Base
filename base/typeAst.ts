export type NodeType =
  | "Program"
  | "NumericLiteral"
  | "NullLiteral"
  | "Identifier"
  | "BinaryExpr"
  | "CallExpr"
  | "UnaryExpr"
  | "FunctionDeclaration"
  | "VariableDeclaration"
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

export interface Expression extends Statement {}

export interface BinaryExpr extends Expression {
  kind: "BinaryExpr";
  left: Expression;
  right: Expression;
  operator: string;
}

export interface Identifier extends Expression {
  kind: "Identifier";
  symbol: string;
}

export interface NumericLiteral extends Expression {
  kind: "NumericLiteral";
  value: number;
}

export interface NullLiteral extends Expression {
  kind: "NullLiteral";
  value: "null";
}
