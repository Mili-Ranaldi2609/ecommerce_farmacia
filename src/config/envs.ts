import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars{
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    SWAGGER_PATH: string;
    SWAGGER_PASSWORD: string;
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    SWAGGER_PATH: joi.string().required(),
    SWAGGER_PASSWORD: joi.string().required(),
})
.unknown(true);

const { error, value } = envsSchema.validate({...process.env,
});

if(error){
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars:EnvVars = value;

export const envs = {
    port: envVars.PORT,
    database_url: envVars.DATABASE_URL,
    jwtSecret: envVars.JWT_SECRET,
    swaggerPath: envVars.SWAGGER_PATH,
    swaggerPassword: envVars.SWAGGER_PASSWORD,
}