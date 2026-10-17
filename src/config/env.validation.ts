import Joi from 'joi';

/** Validates the environment variables the configuration is built from. */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test'),
  PORT: Joi.number().port().default(3000),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string(),
  ALLOW_SIGNUP: Joi.boolean(),
});
