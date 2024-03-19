import {
  Statement,
  Program,
  Expression,
  BinaryExpr,
  Identifier,
  NumericLiteral,
  VarDeclaration,
  AssignmentExpr,
  Property,
  ObjectLiteral,
  CallExpr,
  MemberExpr,
} from "./typeAst.ts";
import { tokenize, Token, TokenType } from "./lexer.ts";

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
      Deno.exit(1);
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
    // skip parseStatement
    switch (this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parse_var_declaration();
      default:
        return this.parseExpression();
    }
  }

  parse_var_declaration(): Statement {
    const isConstant = this.next().type == TokenType.Const;
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
    this.expectRender(
      TokenType.Equals,
      "Expected equals tokens identifier in var declaraytion"
    );
    const declaration = {
      kind: "VarDeclaration",
      value: this.parseExpression(),
      identifier,
      constant: isConstant,
    } as VarDeclaration;
    this.expectRender(
      TokenType.Semicolon,
      "Var declaration state must end with semicolon"
    );
    return declaration;
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
    if (this.at().type !== TokenType.OpenBrace) {
      return this.parse_add_expr();
    }
    this.next();
    const properties = new Array<Property>();
    while (this.notEOF() && this.at().type != TokenType.CloseBrace) {
      const key = this.expectRender(TokenType.Identifier, "Key expected").value;
      // key: pair => key //
      if (this.at().type == TokenType.Comma) {
        this.next();
        properties.push({ key, kind: "Property" } as Property);
        continue;
      }
      // key: pair => {key} //
      else if (this.at().type == TokenType.CloseBrace) {
        properties.push({ key, kind: "Property" });
        continue;
      }
      // { key: data } //
      this.expectRender(
        TokenType.Colon,
        "Key colon mising in object expression"
      );
      const value = this.parseExpression();
      properties.push({ kind: "Property", value, key });
      if (this.at().type != TokenType.CloseBrace) {
        this.expectRender(TokenType.Comma, "Key colon is expected");
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
    while (
      this.at().value == "/" ||
      this.at().value == "*" ||
      this.at().value == "%"
    ) {
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
    let call_expr: Expression = {
      kind: "CallExpr",
      caller,
      args: this.parse_args(),
    } as CallExpr;
    if (this.at().type == TokenType.OpenParen) {
      call_expr = this.parse_call_expr(call_expr);
    }
    return call_expr;
  }

  private parse_args(): Expression[] {
    this.expectRender(TokenType.OpenParen, "Required open Parenthesis");
    const args =
      this.at().type == TokenType.CloseParen ? [] : this.parse_arguments_list();
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
      this.at().type == TokenType.OpenBracket
    ) {
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
        this.expectRender(
          TokenType.CloseBracket,
          "Closing bracket computed property missing"
        );
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
      case TokenType.OpenParen: {
        this.next();
        const value = this.parseExpression();
        this.expectRender(
          TokenType.CloseParen,
          "Unexpected token found inside expression, Expecting closing parenthesis"
        );
        return value;
      }
      default:
        console.error("Error token found in parsing", this.at());        
        Deno.exit(1);
    }
  }
}
