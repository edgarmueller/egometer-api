export class LoginEmailRecentlySentError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, LoginEmailRecentlySentError.prototype);
  }
}
