export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  mongoDb: {
    uri: process.env.MONGODB_URI,
  },
});
