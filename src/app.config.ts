import { registerAs } from '@nestjs/config'
import Joi from 'joi'

export const AppSchema = {
  CORS_ORIGINS: Joi.string().optional(),
  PORT: Joi.number().default(3000),
}

export const appConfig = registerAs('app', () => {
  const corsOrigins = process.env['CORS_ORIGINS']
  return {
    corsOrigins: corsOrigins
      ? corsOrigins.split(',').map((o) => o.trim())
      : [],
    port: Number(process.env['PORT']) || 3000,
  }
})
