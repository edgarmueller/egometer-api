export class UserAlreadyRegisteredError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, UserAlreadyRegisteredError.prototype);
  }
}
