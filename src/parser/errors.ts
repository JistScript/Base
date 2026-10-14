export class JistSyntaxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JistSyntaxError";
  }
}
