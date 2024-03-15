import {
  Statement,
  Program,
  Expression,
  BinaryExpr,
  Identifier,
  NumericLiteral,
  VarDeclaration,
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
    return this.parse_add_expr();
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
    let left = this.parse_prime_expr();
    while (
      this.at().value == "/" ||
      this.at().value == "*" ||
      this.at().value == "%"
    ) {
      const operator = this.next().value;
      const right = this.parse_prime_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }
    return left;
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
