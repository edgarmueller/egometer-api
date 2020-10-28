export class InvalidEmailTokenError extends Error {
  constructor(msg: string) {
    super(msg);
    // https://stackoverflow.com/questions/31626231/custom-error-class-in-typescript
    Object.setPrototypeOf(this, InvalidEmailTokenError.prototype);
  }
}
