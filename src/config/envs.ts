// src/config/envs.ts
import 'dotenv/config';
import * as Joi from 'joi';

// Validación de variables de entorno
const schema = Joi.object({
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(16).required(),

  SWAGGER_PATH: Joi.string().default('/api/docs'),
  SWAGGER_PASSWORD: Joi.string().min(6).required(),

  PASSWORD_GOOGLE_GENERIC: Joi.string().required(),

  // Google puede quedar vacío si no lo usás en local
  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional(),
  GOOGLE_CALLBACK_URL: Joi.string().allow('').optional(),

  // Blob opcional (permitir vacío)
  BLOB_READ_WRITE_TOKEN: Joi.string().allow('').optional(),

  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
}).unknown(true);

const { value: env, error } = schema
  .prefs({ errors: { label: 'key' }, abortEarly: false })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Normalizo la ruta de Swagger a que siempre empiece con "/"
const normalizedSwaggerPath =
  (env.SWAGGER_PATH as string).startsWith('/') ? env.SWAGGER_PATH : `/${env.SWAGGER_PATH}`;

// Tipo de salida (opcional, para ayuda de TS)
type Envs = {
  port: number;
  database_url: string;
  jwtSecret: string;
  swaggerPath: string;
  swaggerPassword: string;
  passwordGoogleGeneric: string;
  googleClientId?: string;
  googleClientSecret?: string;
  googleCallbackUrl?: string;
  blobReadWriteToken?: string;
  nodeEnv: 'development' | 'production' | 'test';
};

// Export: mantiene los mismos nombres que usabas
export const envs: Envs = {
  port: Number(env.PORT),
  database_url: env.DATABASE_URL as string,
  jwtSecret: env.JWT_SECRET as string,
  swaggerPath: normalizedSwaggerPath,
  swaggerPassword: env.SWAGGER_PASSWORD as string,
  passwordGoogleGeneric: env.PASSWORD_GOOGLE_GENERIC as string,

  googleClientId: env.GOOGLE_CLIENT_ID || undefined,
  googleClientSecret: env.GOOGLE_CLIENT_SECRET || undefined,
  googleCallbackUrl: env.GOOGLE_CALLBACK_URL || undefined,

  blobReadWriteToken: env.BLOB_READ_WRITE_TOKEN || undefined,
  nodeEnv: env.NODE_ENV as Envs['nodeEnv'],
};
