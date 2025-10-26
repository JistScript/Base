import {
  Statement,
  Program,
  Expression,
  BinaryExpr,
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
} from "./typeAst";
import { tokenize, Token, TokenType } from "./lexer";

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

  private expectRender(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error("Parser Error:\n", err, prev, "- Expect: ", type);
      process.exit(1);
      // Deno.exit(1);
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

  private parseStatement(): Statement {
    // skip parseStatement //
    switch (this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parse_var_declaration();
      case TokenType.Function:
        return this.parse_function_declaration();
      case TokenType.Identifier:
        // Check if this is a return statement //
        if (this.at().value === "return") {
          return this.parse_return_statement();
        }
      // Fall through to default for other identifiers //
      default: {
        const expr = this.parseExpression();
        if (this.at().type === TokenType.Semicolon) {
          this.next();
        }
        return expr;
      }
    }
  }

  private parse_return_statement(): Statement {
    this.next();
    if (this.at().type === TokenType.Semicolon) {
      this.next();
      return {
        kind: "ReturnStatement",
        value: undefined,
      } as any;
    }
    const value = this.parseExpression();
    if (this.at().type === TokenType.Semicolon) {
      this.next();
    }
    return {
      kind: "ReturnStatement",
      value,
    } as any;
  }

  parse_function_declaration(): Statement {
    this.next();
    const name = this.expectRender(TokenType.Identifier, "Name is required for all function").value;
    const args = this.parse_args();
    const params: string[] = [];
    for (const arg of args) {
      if (arg.kind != "Identifier") {
        console.log(arg);
        throw "Expected declaration inside function to be a string";
      }
      params.push((arg as Identifier).symbol);
    }
    this.expectRender(TokenType.OpenBrace, "Function expected a body declaration");
    const body: Statement[] = [];
    while (this.at().type != TokenType.EOF && this.at().type != TokenType.CloseBrace) {
      body.push(this.parseStatement());
    }
    this.expectRender(TokenType.CloseBrace, "Required a closing brace for a function declaration");
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
        throw "Assigned value to constant, but no value provided";
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
        throw "Expected comma or closing bracket in destructuring";
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
      return this.parse_add_expr();
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

  // add and sub //
  private parse_add_expr(): Expression {
    let left = this.parse_multi_expr();
    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.next().value;
      const right = this.parse_multi_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }
    return left;
  }

  // multi //
  private parse_multi_expr(): Expression {
    let left = this.parse_call_member_expr();
    while (this.at().value == "/" || this.at().value == "*" || this.at().value == "%") {
      const operator = this.next().value;
      const right = this.parse_call_member_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }
    return left;
  }

  private parse_call_member_expr(): Expression {
    const member = this.parse_member_expr();
    if (this.at().type == TokenType.OpenParen) {
      return this.parse_call_expr(member);
    }
    return member;
  }

  private parse_call_expr(caller: Expression): Expression {
    const args = this.parse_args();
    let call_expr: Expression = {
      kind: "CallExpr",
      caller,
      args,
    } as CallExpr;
    // Handle chained calls //
    if (this.at().type == TokenType.OpenParen) {
      call_expr = this.parse_call_expr(call_expr);
    }

    return call_expr;
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
      this.at().type == TokenType.Colon
    ) {
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
          throw `Invalid property dot operator without identifier`;
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

  // parser primary //
  private parse_prime_expr(): Expression {
    const tk = this.at().type;
    switch (tk) {
      case TokenType.Identifier:
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
            throw "Expected comma or closing bracket in array literal";
          }
        }
        this.expectRender(TokenType.CloseBracket, "Expected closing bracket for array literal");
        return { kind: "ArrayLiteral", elements } as ArrayLiteral;
      }
      default:
        console.error("Error token found in parsing", this.at());
        process.exit(1);
      // Deno.exit(1);
    }
  }
}
