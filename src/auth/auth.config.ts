import { registerAs } from '@nestjs/config'
import Joi from 'joi'

export enum AuthConfigKeys {
  AccessTokenSecret = 'auth.accessToken.secret',
  AccessTokenExpirationInSeconds = 'auth.accessToken.expirationInSeconds',
}

const DEFAULT_ACCESS_TOKEN_EXPIRATION = 86400

export const AuthConfigSchema = {
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION_IN_SECONDS: Joi.number().default(
    DEFAULT_ACCESS_TOKEN_EXPIRATION,
  ),
}

export const authConfig = registerAs('auth', () => ({
  accessToken: {
    secret: process.env['JWT_ACCESS_TOKEN_SECRET'],
    expirationInSeconds:
      Number(process.env['JWT_ACCESS_TOKEN_EXPIRATION_IN_SECONDS']) ||
      DEFAULT_ACCESS_TOKEN_EXPIRATION,
  },
}))
