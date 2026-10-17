export default () => ({
  features: {
    // Joi accepts e.g. FALSE as a boolean, so compare case-insensitively
    signUp: String(process.env.ALLOW_SIGNUP).toLowerCase() !== 'false',
  },
  frontend: {
    host: process.env.FRONTEND_HOST,
    port: process.env.FRONTEND_PORT,
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
  },
  mongoDb: {
    uri: process.env.MONGODB_URI,
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE,
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
  },
});
