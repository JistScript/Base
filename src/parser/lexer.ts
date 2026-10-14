import { JistSyntaxError } from "./errors";

export enum TokenType {
  Number,
  Identifier,
  Let,
  Const,
  Function,
  Equals,
  Semicolon,
  BinaryOperator,
  ComparisonOperator,
  LogicalOperator,
  OpenParen,
  CloseParen,
  OpenBrace,
  CloseBrace,
  OpenBracket,
  CloseBracket,
  Comma,
  Colon,
  Dot,
  StringLiteral,
  TypeAnnotation,
  Spread,
  Export,
  Default,
  Question,
  Not,
  EOF,
  If,
  Else,
  For,
  While,
  Of,
  Return,
  Arrow,
  Pipe,
}

// Map (not a plain object) so identifiers like "constructor" or "toString" //
const ReservedKeywords = new Map<string, TokenType>([
  ["let", TokenType.Let],
  ["const", TokenType.Const],
  ["function", TokenType.Function],
  ["export", TokenType.Export],
  ["default", TokenType.Default],
  ["if", TokenType.If],
  ["else", TokenType.Else],
  ["for", TokenType.For],
  ["while", TokenType.While],
  ["of", TokenType.Of],
  ["return", TokenType.Return],
]);

// Built-in type keywords //
const TypeKeywords = new Set(["String", "Number", "Boolean", "Array", "Object", "Any", "Void"]);

export interface Token {
  value: string;
  type: TokenType;
}

function createToken(value: string, type: TokenType): Token {
  return { value, type };
}

function isAlphabetic(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || char === "_";
}

function isSkippable(char: string): boolean {
  return /\s/.test(char);
}

function isInt(char: string): boolean {
  return /^[0-9]+$/.test(char);
}

function isAlphaNumeric(char: string): boolean {
  return isAlphabetic(char) || isInt(char);
}

// Reads a string body up to the closing quote, handling escape sequences //
function readString(src: string[], quote: string): string {
  let out = "";
  while (src.length > 0 && src[0] !== quote) {
    const c = src.shift()!;
    if (c === "\\" && src.length > 0) {
      const n = src.shift()!;
      out += n === "n" ? "\n" : n === "t" ? "\t" : n;
    } else out += c;
  }
  if (src.length === 0) throw new JistSyntaxError("Unterminated string literal");
  src.shift(); // closing quote
  return out;
}

export function tokenize(sourceCode: string): Token[] {
  const tokens: Token[] = [];
  const src: string[] = sourceCode.split("");

  while (src.length > 0) {
    const char = src.shift()!;

    switch (char) {
      case "(":
        tokens.push(createToken(char, TokenType.OpenParen));
        break;
      case ")":
        tokens.push(createToken(char, TokenType.CloseParen));
        break;
      case "{":
        tokens.push(createToken(char, TokenType.OpenBrace));
        break;
      case "}":
        tokens.push(createToken(char, TokenType.CloseBrace));
        break;
      case "[":
        tokens.push(createToken(char, TokenType.OpenBracket));
        break;
      case "]":
        tokens.push(createToken(char, TokenType.CloseBracket));
        break;
      case "+":
      case "-":
      case "*":
      case "%":
        tokens.push(createToken(char, TokenType.BinaryOperator));
        break;
      case "/": {
        const next: string | undefined = src[0];
        if (next === "/") {
          while (src.length > 0 && src[0] !== "\n") src.shift();
        } else if (next === "*") {
          src.shift();
          while (src.length > 0 && !(src[0] === "*" && src[1] === "/")) src.shift();
          if (src.length === 0) throw new JistSyntaxError("Unterminated block comment");
          src.shift();
          src.shift();
        } else tokens.push(createToken(char, TokenType.BinaryOperator));
        break;
      }
      case "=":
        if (src[0] === ">") {
          src.shift();
          tokens.push(createToken("=>", TokenType.Arrow));
          break;
        }
        if (src.length > 0 && src[0] === "=") {
          src.shift();
          if (src.length > 0 && src[0] === "=") {
            src.shift();
            tokens.push(createToken("===", TokenType.ComparisonOperator));
          } else {
            tokens.push(createToken("==", TokenType.ComparisonOperator));
          }
        } else {
          tokens.push(createToken(char, TokenType.Equals));
        }
        break;
      case "!":
        if (src.length > 0 && src[0] === "=") {
          src.shift();
          if (src.length > 0 && src[0] === "=") {
            src.shift();
            tokens.push(createToken("!==", TokenType.ComparisonOperator));
          } else {
            tokens.push(createToken("!=", TokenType.ComparisonOperator));
          }
        } else {
          tokens.push(createToken(char, TokenType.Not));
        }
        break;
      case "<":
        if (src.length > 0 && src[0] === "=") {
          src.shift();
          tokens.push(createToken("<=", TokenType.ComparisonOperator));
        } else {
          tokens.push(createToken(char, TokenType.ComparisonOperator));
        }
        break;
      case ">":
        if (src.length > 0 && src[0] === "=") {
          src.shift();
          tokens.push(createToken(">=", TokenType.ComparisonOperator));
        } else {
          tokens.push(createToken(char, TokenType.ComparisonOperator));
        }
        break;
      case "&":
        if (src.length > 0 && src[0] === "&") {
          src.shift();
          tokens.push(createToken("&&", TokenType.LogicalOperator));
        } else {
          throw new JistSyntaxError("Unexpected '&'. Did you mean '&&'?");
        }
        break;
      case "|":
        if (src[0] === "|") {
          src.shift();
          tokens.push(createToken("||", TokenType.LogicalOperator));
        } else if (src[0] === ">") {
          src.shift();
          tokens.push(createToken("|>", TokenType.Pipe));
        } else throw new JistSyntaxError("Unexpected '|'. Did you mean '||' or '|>'?");
        break;
      case "?":
        tokens.push(createToken(char, TokenType.Question));
        break;
      case ";":
        tokens.push(createToken(char, TokenType.Semicolon));
        break;
      case ":":
        tokens.push(createToken(char, TokenType.Colon));
        break;
      case ",":
        tokens.push(createToken(char, TokenType.Comma));
        break;
      case ".":
        // Check for spread operator //
        if (src.length >= 2 && src[0] === "." && src[1] === ".") {
          src.shift();
          src.shift();
          tokens.push(createToken("...", TokenType.Spread));
        } else {
          tokens.push(createToken(char, TokenType.Dot));
        }
        break;
      case '"':
      case "'":
        tokens.push(createToken(readString(src, char), TokenType.StringLiteral));
        break;
      default:
        if (isInt(char)) {
          let num = char;
          while (src.length > 0 && (isInt(src[0]) || src[0] === ".")) {
            num += src.shift()!;
          }
          tokens.push(createToken(num, TokenType.Number));
        } else if (isAlphabetic(char)) {
          let ident = char;
          while (src.length > 0 && isAlphaNumeric(src[0])) {
            ident += src.shift()!;
          }
          if (TypeKeywords.has(ident)) {
            tokens.push(createToken(ident, TokenType.TypeAnnotation));
          } else {
            tokens.push(createToken(ident, ReservedKeywords.get(ident) ?? TokenType.Identifier));
          }
        } else if (isSkippable(char)) {
          continue;
        } else {
          throw new JistSyntaxError(
            `Unrecognized character '${char}' (code ${char.charCodeAt(0)})`
          );
        }
    }
  }

  tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
  return tokens;
}
