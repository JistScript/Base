import {
  Statement,
  Program,
  Expression,
  Identifier,
  NumericLiteral,
  VarDeclaration,
  FunctionDeclaration,
  AssignmentExpr,
  Property,
  ObjectLiteral,
  CallExpr,
  MemberExpr,
  StringLiteral,
  ArrayLiteral,
  TypeAnnotation,
  IfStatement,
  ForOfStatement,
  ArrowFunctionExpression,
} from "./typeAst.js";
import { tokenize, Token, TokenType } from "./lexer.js";
import { JistSyntaxError } from "./errors.js";

export default class Parser {
  private tokens: Token[] = [];

  private notEOF(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  private at() {
    return this.tokens[0] as Token;
  }

  private next() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  private expectRender(type: TokenType, err: string) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      throw new JistSyntaxError(`${err} (got "${prev?.value}")`);
    }
    return prev;
  }

  public proTypeAsst(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    // end of the file //
    while (this.notEOF()) {
      program.body.push(this.parseStatement());
    }
    return program;
  }

  // ---------------------------------------------------------------------------
  // Statements
  // ---------------------------------------------------------------------------

  private parseStatement(): Statement {
    switch (this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parse_var_declaration();
      case TokenType.Function:
        return this.parse_function_declaration();
      case TokenType.Return:
        return this.parse_return_statement();
      case TokenType.If:
        return this.parse_if_statement();
      case TokenType.While:
        return this.parse_while_statement();
      case TokenType.For:
        return this.parse_for_of_statement();
      default: {
        const expr = this.parseExpression();
        if (this.at().type === TokenType.Semicolon) {
          this.next();
        }
        return expr;
      }
    }
  }

  private parse_block(): Statement[] {
    this.expectRender(TokenType.OpenBrace, "Expected '{'");
    const body: Statement[] = [];
    while (this.notEOF() && this.at().type !== TokenType.CloseBrace)
      body.push(this.parseStatement());
    this.expectRender(TokenType.CloseBrace, "Expected '}'");
    return body;
  }

  private parse_return_statement(): Statement {
    this.next();
    const t = this.at().type;
    const value =
      t === TokenType.Semicolon || t === TokenType.CloseBrace ? undefined : this.parseExpression();
    if (this.at().type === TokenType.Semicolon) this.next();
    return { kind: "ReturnStatement", value } as any;
  }

  private parse_if_statement(): IfStatement {
    this.next();
    this.expectRender(TokenType.OpenParen, "Expected '(' after if");
    const test = this.parseExpression();
    this.expectRender(TokenType.CloseParen, "Expected ')' after condition");
    const consequent = this.parse_block();
    let alternate: Statement[] | IfStatement | undefined;
    if (this.at().type === TokenType.Else) {
      this.next();
      alternate = this.at().type === TokenType.If ? this.parse_if_statement() : this.parse_block();
    }
    return { kind: "IfStatement", test, consequent, alternate };
  }

  private parse_while_statement(): Statement {
    this.next();
    this.expectRender(TokenType.OpenParen, "Expected '(' after while");
    const test = this.parseExpression();
    this.expectRender(TokenType.CloseParen, "Expected ')'");
    return { kind: "WhileStatement", test, body: this.parse_block() } as Statement;
  }

  private parse_for_of_statement(): Statement {
    this.next();
    this.expectRender(TokenType.OpenParen, "Expected '(' after for");
    const constant = this.next().type === TokenType.Const;
    const variable = this.expectRender(TokenType.Identifier, "Expected loop variable").value;
    this.expectRender(TokenType.Of, "Expected 'of'");
    const iterable = this.parseExpression();
    this.expectRender(TokenType.CloseParen, "Expected ')'");
    return {
      kind: "ForOfStatement",
      constant,
      variable,
      iterable,
      body: this.parse_block(),
    } as ForOfStatement;
  }

  parse_function_declaration(): Statement {
    this.next();
    const name = this.expectRender(TokenType.Identifier, "Name is required for all function").value;
    const args = this.parse_args();
    const params: string[] = [];
    for (const arg of args) {
      if (arg.kind != "Identifier") {
        throw new JistSyntaxError("Function parameters must be plain identifiers");
      }
      params.push((arg as Identifier).symbol);
    }
    const body = this.parse_block();
    const fn = {
      kind: "FunctionDeclaration",
      parameters: params,
      body,
      name,
    } as FunctionDeclaration;
    return fn;
  }

  parse_var_declaration(): Statement {
    const isConstant = this.next().type == TokenType.Const;
    if (this.at().type === TokenType.OpenBracket) {
      return this.parse_destructuring_declaration(isConstant);
    }
    const identifier = this.expectRender(
      TokenType.Identifier,
      "Expected Identifier to let or const keywords"
    ).value;
    if (this.at().type == TokenType.Semicolon) {
      this.next();
      if (isConstant) {
        throw new JistSyntaxError("Constant declaration requires a value");
      }
      return {
        kind: "VarDeclaration",
        identifier,
        constant: false,
      } as VarDeclaration;
    }
    this.expectRender(TokenType.Equals, "Expected equals tokens identifier in var declaration");
    const declaration = {
      kind: "VarDeclaration",
      value: this.parseExpression(),
      identifier,
      constant: isConstant,
    } as VarDeclaration;
    this.expectRender(TokenType.Semicolon, "Var declaration state must end with semicolon");
    return declaration;
  }

  private parse_destructuring_declaration(isConstant: boolean): Statement {
    this.next();
    const elements: Identifier[] = [];
    while (this.at().type !== TokenType.CloseBracket) {
      const elem = this.expectRender(TokenType.Identifier, "Expected identifier in destructuring");
      elements.push({ kind: "Identifier", symbol: elem.value } as Identifier);
      if (this.at().type === TokenType.Comma) {
        this.next();
      } else if (this.at().type !== TokenType.CloseBracket) {
        throw new JistSyntaxError("Expected comma or closing bracket in destructuring");
      }
    }
    this.expectRender(TokenType.CloseBracket, "Expected closing bracket in destructuring");
    this.expectRender(TokenType.Equals, "Expected equals after destructuring");
    const value = this.parseExpression();
    this.expectRender(TokenType.Semicolon, "Var declaration must end with semicolon");
    return {
      kind: "VarDeclaration",
      identifier: "",
      constant: isConstant,
      value,
      destructuring: {
        kind: "ArrayDestructuring",
        elements,
      },
    } as VarDeclaration;
  }

  // Expressions (lowest to highest precedence)//
  private parseExpression(): Expression {
    return this.parse_assignment_expr();
  }

  private parse_assignment_expr(): Expression {
    const left = this.parse_obj_expr();
    if (this.at().type === TokenType.Equals) {
      this.next();
      const value = this.parse_assignment_expr();
      return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
    }
    return left;
  }

  private parse_obj_expr(): Expression {
    if (this.at().type != TokenType.OpenBrace) {
      return this.parse_ternary_expr();
    }
    this.next();
    const properties = new Array<Property>();
    while (this.notEOF() && this.at().type != TokenType.CloseBrace) {
      const keyToken = this.at();
      if (keyToken.type !== TokenType.Identifier && keyToken.type !== TokenType.TypeAnnotation) {
        this.expectRender(TokenType.Identifier, "Key expected");
      }
      const key = this.next().value;
      if (this.at().type == TokenType.Comma) {
        this.next();
        properties.push({ key, kind: "Property" } as Property);
        continue;
      } else if (this.at().type == TokenType.CloseBrace) {
        properties.push({ key, kind: "Property" });
        continue;
      }
      // Full property: { key: value } //
      this.expectRender(TokenType.Colon, "Key colon missing in object expression");
      const value = this.parseExpression();
      properties.push({ kind: "Property", value, key });
      if (this.at().type != TokenType.CloseBrace) {
        this.expectRender(TokenType.Comma, "Comma expected after property");
      }
    }
    this.expectRender(TokenType.CloseBrace, "Closing bracket not rendered");
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
  }

  private parse_ternary_expr(): Expression {
    const test = this.parse_pipe_expr();
    if (this.at().type !== TokenType.Question) return test;
    this.next();
    const consequent = this.parseExpression();
    this.expectRender(TokenType.Colon, "Expected ':' in conditional expression");
    const alternate = this.parseExpression();
    return { kind: "ConditionalExpr", test, consequent, alternate } as Expression;
  }

  // `a |> f(b)` desugars to f(a, b); `a |> f` desugars to f(a)
  private parse_pipe_expr(): Expression {
    let left = this.parse_or_expr();
    while (this.at().type === TokenType.Pipe) {
      this.next();
      const right = this.parse_or_expr();
      left =
        right.kind === "CallExpr"
          ? ({ ...right, args: [left, ...(right as CallExpr).args] } as CallExpr)
          : ({ kind: "CallExpr", caller: right, args: [left] } as CallExpr);
    }
    return left;
  }

  private binaryLevel(next: () => Expression, ops: string[], kind: string): Expression {
    const opTypes = [
      TokenType.BinaryOperator,
      TokenType.ComparisonOperator,
      TokenType.LogicalOperator,
    ];
    let left = next();
    while (opTypes.includes(this.at().type) && ops.includes(this.at().value)) {
      const operator = this.next().value;
      left = { kind, left, right: next(), operator } as Expression;
    }
    return left;
  }
  private parse_or_expr() {
    return this.binaryLevel(() => this.parse_and_expr(), ["||"], "LogicalExpr");
  }
  private parse_and_expr() {
    return this.binaryLevel(() => this.parse_equality_expr(), ["&&"], "LogicalExpr");
  }
  private parse_equality_expr() {
    return this.binaryLevel(
      () => this.parse_relational_expr(),
      ["==", "!=", "===", "!=="],
      "BinaryExpr"
    );
  }
  private parse_relational_expr() {
    return this.binaryLevel(() => this.parse_add_expr(), ["<", "<=", ">", ">="], "BinaryExpr");
  }
  private parse_add_expr() {
    return this.binaryLevel(() => this.parse_multi_expr(), ["+", "-"], "BinaryExpr");
  }
  private parse_multi_expr() {
    return this.binaryLevel(() => this.parse_unary_expr(), ["*", "/", "%"], "BinaryExpr");
  }

  private parse_unary_expr(): Expression {
    const t = this.at();
    if (t.type === TokenType.Not || (t.type === TokenType.BinaryOperator && t.value === "-")) {
      this.next();
      return {
        kind: "UnaryExpr",
        operator: t.value,
        argument: this.parse_unary_expr(),
      } as Expression;
    }
    return this.parse_member_expr();
  }

  private parse_type_annotation(): { typeAnnotation: TypeAnnotation; functionArgs?: Expression[] } {
    const typeName = this.expectRender(TokenType.TypeAnnotation, "Expected type annotation").value;
    let genericTypes: TypeAnnotation[] | undefined;
    let functionArgs: Expression[] | undefined;
    if (this.at().type === TokenType.OpenParen) {
      const nextToken = this.tokens[1];
      if (nextToken && nextToken.type === TokenType.TypeAnnotation) {
        this.next();
        genericTypes = [];
        while (this.at().type === TokenType.TypeAnnotation) {
          genericTypes.push(this.parse_type_annotation().typeAnnotation);
          if (this.at().type === TokenType.Comma) {
            const nextAfterComma = this.tokens[1];
            if (nextAfterComma && nextAfterComma.type === TokenType.TypeAnnotation) {
              this.next();
            } else {
              this.next();
              functionArgs = [];
              while (this.at().type !== TokenType.CloseParen && this.at().type !== TokenType.EOF) {
                functionArgs.push(this.parseExpression());
                if (this.at().type === TokenType.Comma) {
                  this.next();
                } else {
                  break;
                }
              }
              this.expectRender(TokenType.CloseParen, "Expected closing paren");
              break;
            }
          } else if (this.at().type === TokenType.CloseParen) {
            // Properly closed generics //
            this.next();
            break;
          } else {
            this.expectRender(TokenType.CloseParen, "Expected closing paren for generic type");
            break;
          }
        }
      }
    }

    return {
      typeAnnotation: {
        kind: "TypeAnnotation",
        typeName,
        genericTypes,
      } as TypeAnnotation,
      functionArgs,
    };
  }

  private parse_args(): Expression[] {
    this.expectRender(TokenType.OpenParen, "Required open Parenthesis");
    const args = this.at().type == TokenType.CloseParen ? [] : this.parse_arguments_list();
    this.expectRender(TokenType.CloseParen, "Closing Parenthesis Required");
    return args;
  }

  private parse_arguments_list(): Expression[] {
    const args = [this.parse_assignment_expr()];
    while (this.at().type == TokenType.Comma && this.next()) {
      args.push(this.parse_assignment_expr());
    }
    return args;
  }

  private parse_member_expr(): Expression {
    let object = this.parse_prime_expr();

    while (
      this.at().type == TokenType.Dot ||
      this.at().type == TokenType.OpenBracket ||
      this.at().type == TokenType.OpenParen ||
      // ':' is a type annotation only when a type name follows (so `a ? b : c` still works)
      (this.at().type == TokenType.Colon && this.tokens[1]?.type === TokenType.TypeAnnotation)
    ) {
      if (this.at().type == TokenType.OpenParen) {
        object = { kind: "CallExpr", caller: object, args: this.parse_args() } as CallExpr;
        continue;
      }

      if (this.at().type == TokenType.Colon) {
        this.next();
        const result = this.parse_type_annotation();
        const typeAnnotation = result.typeAnnotation;
        let args: Expression[] = result.functionArgs || [];
        if (args.length === 0 && this.at().type === TokenType.OpenParen) {
          args = this.parse_args();
        }
        object = {
          kind: "CallExpr",
          caller: object,
          args,
          typeAnnotation,
        } as CallExpr;
        continue;
      }

      const operator = this.next();
      let property: Expression;
      let computed: boolean;

      // non computed property //
      if (operator.type == TokenType.Dot) {
        property = this.parse_prime_expr();
        computed = false;
        if (property.kind != "Identifier") {
          throw new JistSyntaxError("Invalid property dot operator without identifier");
        }
      } else {
        property = this.parseExpression();
        computed = true;
        this.expectRender(TokenType.CloseBracket, "Closing bracket computed property missing");
      }
      object = { kind: "MemberExpr", object, property, computed } as MemberExpr;
    }
    return object;
  }

  // Arrow functions //

  private isArrowAhead(): boolean {
    let depth = 0;
    for (let i = 0; i < this.tokens.length; i++) {
      const t = this.tokens[i].type;
      if (t === TokenType.OpenParen) depth++;
      else if (t === TokenType.CloseParen && --depth === 0)
        return this.tokens[i + 1]?.type === TokenType.Arrow;
      else if (t === TokenType.EOF) return false;
    }
    return false;
  }

  private parse_arrow_body(parameters: string[]): Expression {
    this.expectRender(TokenType.Arrow, "Expected '=>'");
    const body: Statement[] =
      this.at().type === TokenType.OpenBrace
        ? this.parse_block()
        : [{ kind: "ReturnStatement", value: this.parse_assignment_expr() } as any];
    return { kind: "ArrowFunctionExpression", parameters, body } as ArrowFunctionExpression;
  }

  // parser primary //
  private parse_prime_expr(): Expression {
    const tk = this.at().type;
    switch (tk) {
      case TokenType.Identifier:
        if (this.tokens[1]?.type === TokenType.Arrow) {
          const param = this.next().value;
          return this.parse_arrow_body([param]);
        }
        return { kind: "Identifier", symbol: this.next().value } as Identifier;
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.next().value),
        } as NumericLiteral;
      case TokenType.StringLiteral:
        return {
          kind: "StringLiteral",
          value: this.next().value,
        } as StringLiteral;
      case TokenType.OpenParen: {
        if (this.isArrowAhead()) {
          const params = this.parse_args().map(a => {
            if (a.kind !== "Identifier") {
              throw new JistSyntaxError("Arrow function parameters must be plain identifiers");
            }
            return (a as Identifier).symbol;
          });
          return this.parse_arrow_body(params);
        }
        this.next();
        const value = this.parseExpression();
        this.expectRender(
          TokenType.CloseParen,
          "Unexpected token found inside expression, Expecting closing parenthesis"
        );
        return value;
      }
      case TokenType.OpenBracket: {
        this.next();
        const elements: Expression[] = [];
        while (this.at().type !== TokenType.CloseBracket) {
          elements.push(this.parseExpression());
          if (this.at().type === TokenType.Comma) {
            this.next();
          } else if (this.at().type !== TokenType.CloseBracket) {
            throw new JistSyntaxError("Expected comma or closing bracket in array literal");
          }
        }
        this.expectRender(TokenType.CloseBracket, "Expected closing bracket for array literal");
        return { kind: "ArrayLiteral", elements } as ArrayLiteral;
      }
      default:
        throw new JistSyntaxError(`Unexpected token "${this.at().value}"`);
    }
  }
}
