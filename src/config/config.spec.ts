import config from '.';

describe('config', () => {
  const original = process.env.ALLOW_SIGNUP;

  afterEach(() => {
    process.env.ALLOW_SIGNUP = original;
  });

  it.each([
    [undefined, true],
    ['true', true],
    ['false', false],
    ['FALSE', false],
    ['False', false],
  ])('ALLOW_SIGNUP=%s enables sign-up: %s', (value, expected) => {
    if (value === undefined) {
      delete process.env.ALLOW_SIGNUP;
    } else {
      process.env.ALLOW_SIGNUP = value;
    }
    expect(config().features.signUp).toBe(expected);
  });
});
