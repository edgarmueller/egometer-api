export default () => ({
  features: {
    signUp: process.env.FEATURE_SIGNUP,
  },
  frontend: {
    host: process.env.FRONTEND_HOST,
    port: process.env.FRONTEND_PORT,
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
    auth0: {
      issuer: process.env.AUTH0_ISSUER_URL,
      audience: process.env.AUTH0_AUDIENCE
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
