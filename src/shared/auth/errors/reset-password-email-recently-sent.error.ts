export class ResetPasswordEmailRecentlySentError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, ResetPasswordEmailRecentlySentError.prototype);
  }
}
