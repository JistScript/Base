// Types of token //
export enum TokenType {
  Number,
  Null,
  Identifier,
  Let,
  Equals,
  BinaryOperator,
  OpenParen,
  CloseParen,
  EOF,
}

// Pre-rendered //
const ReservedKeywords: Record<string, TokenType> = {
  let: TokenType.Let,
  null: TokenType.Null,
};

export interface Token {
  value: string;
  type: TokenType;
}

// Token creation function //
function createToken(value: string, type: TokenType): Token {
  return { value, type };
}

// Check if a character is alphabetic //
function isAlphabetic(char: string): boolean {
  return char.toUpperCase() !== char.toLowerCase();
}

// Check if a character is numeric //
function isNumeric(char: string): boolean {
  const charCode = char.charCodeAt(0);
  return charCode >= "0".charCodeAt(0) && charCode <= "9".charCodeAt(0);
}

// Check if a character is skippable //
function isSkippable(char: string): boolean {
  return char === " " || char === "\n" || char === "\t";
}

// Tokenize the source code //
export function tokenize(sourceCode: string): Token[] {
  const tokens: Token[] = [];
  const source = sourceCode.split("");

  let index = 0;
  while (index < source.length) {
    const char = source[index];

    switch (char) {
      case "(":
        tokens.push(createToken(char, TokenType.OpenParen));
        break;
      case ")":
        tokens.push(createToken(char, TokenType.CloseParen));
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
      default:
        if (isAlphabetic(char)) {
          let alpha = "";
          while (index < source.length && isAlphabetic(source[index])) {
            alpha += source[index++];
          }
          const reserved = ReservedKeywords[alpha];
          if (typeof reserved == "number") {
            tokens.push(createToken(alpha, reserved));
          }
          continue;
        } else if (isNumeric(char)) {
          let num = "";
          while (index < source.length && isNumeric(source[index])) {
            num += source[index++];
          }
          tokens.push(createToken(num, TokenType.Number));
          continue;
        } else if (isSkippable(char)) {
          index++;
          continue;
        } else {
          console.log("Unrecognized character detected.", char[0]);
          Deno.exit(1);
        }
    }
    index++;
  }
  tokens.push({ type: TokenType.EOF, value: "EndOfFile" });
  return tokens;
}
