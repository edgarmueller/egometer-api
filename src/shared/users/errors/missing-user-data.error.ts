export class MissingUserDataError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, MissingUserDataError.prototype);
  }
}
