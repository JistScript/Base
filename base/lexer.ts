export enum TokenType {
  Number,
  Identifier,
  Let,
  Const,
  Function,
  Equals,
  Semicolon,
  BinaryOperator,
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
  EOF,
}

const ReservedKeywords: Record<string, TokenType> = {
  let: TokenType.Let,
  const: TokenType.Const,
  function: TokenType.Function,
};

export interface Token {
  value: string;
  type: TokenType;
}

function createToken(value: string, type: TokenType): Token {
  return { value, type };
}

function isAlphabetic(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function isSkippable(char: string): boolean {
  return /\s/.test(char);
}

function isInt(char: string): boolean {
  return /^[0-9]+$/.test(char);
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
      case "/":
      case "%":
        tokens.push(createToken(char, TokenType.BinaryOperator));
        break;
      case "=":
        tokens.push(createToken(char, TokenType.Equals));
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
        tokens.push(createToken(char, TokenType.Dot));
        break;
      case '"': {
        let stringValue = "";
        while (src.length > 0 && src[0] !== '"') {
          stringValue += src.shift()!;
        }
        src.shift();
        tokens.push(createToken(stringValue, TokenType.StringLiteral));
        break;
      }
      default:
        if (isInt(char)) {
          let num = char;
          while (src.length > 0 && isInt(src[0])) {
            num += src.shift()!;
          }
          tokens.push(createToken(num, TokenType.Number));
        } else if (isAlphabetic(char)) {
          let ident = char;
          while (src.length > 0 && isAlphabetic(src[0])) {
            ident += src.shift()!;
          }
          const reserved = ReservedKeywords[ident];
          if (reserved !== undefined) {
            tokens.push(createToken(ident, reserved));
          } else {
            tokens.push(createToken(ident, TokenType.Identifier));
          }
        } else if (isSkippable(char)) {
          continue;
        } else {
          console.error(
            "Unrecognized character found in source:",
            char.charCodeAt(0),
            char
          );
          Deno.exit(1);
        }
    }
  }

  tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
  return tokens;
}
