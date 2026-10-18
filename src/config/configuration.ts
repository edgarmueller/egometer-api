export default () => ({
  port: Number(process.env.PORT ?? 3000),
  mongoDb: {
    uri: process.env.MONGODB_URI,
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },
    // Joi accepts e.g. FALSE as a boolean, so compare case-insensitively
    signUp: String(process.env.ALLOW_SIGNUP).toLowerCase() !== 'false',
  },
});
