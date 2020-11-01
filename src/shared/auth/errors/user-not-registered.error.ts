export class UserNotRegisteredError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, UserNotRegisteredError.prototype);
  }
}
