export class InvalidEmailTokenError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, InvalidEmailTokenError.prototype);
  }
}
