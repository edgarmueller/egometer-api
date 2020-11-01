export class LoginEmailNotVerifiedError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, LoginEmailNotVerifiedError.prototype);
  }
}
