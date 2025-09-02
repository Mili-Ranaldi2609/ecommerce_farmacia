import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  const logger = new Logger('Full Shop Monolito');
  const app = await NestFactory.create(AppModule);

  // Prefijo global /api (mantén GET / root sin prefijo)
  app.setGlobalPrefix('api', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });

  // Normalizo la ruta de swagger desde ENV
  // SWAGGER_PATH debe venir como "/api/docs" (con o sin "/")
  const swaggerPath = (envs.swaggerPath || '/api/docs').startsWith('/')
    ? envs.swaggerPath
    : `/${envs.swaggerPath}`;
  const swaggerSetupPath = swaggerPath.replace(/^\//, ''); // -> "api/docs"

  // Protección BasicAuth para UI y JSON de Swagger
  app.use(
    [swaggerPath, `${swaggerPath}-json`],
    expressBasicAuth({
      users: { admin: envs.swaggerPassword },
      challenge: true,
    }),
  );

  // CORS (podés afinar origins si querés)
  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  // OpenAPI
  const config = new DocumentBuilder()
    .setTitle('API Full Shop Documentation')
    .setDescription(`[ Base URL: http://localhost:${envs.port}/ ]`)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '<h2><b>Ingrese solamente el token JWT, gracias.</b><h2>',
        name: 'Authorization',
      },
      'bearerAuth',
    )
    // opcional: agrega servers si querés que Swagger muestre targets
    // .addServer(`http://localhost:${envs.port}`)
    // .addServer(envs.publicBaseUrl ?? '')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerSetupPath, app, document, {
    customSiteTitle: 'Backend Generator',
    customfavIcon:
      'https://avatars.githubusercontent.com/u/185267919?s=400&u=7d74f9c123b27391d3f11da2815de1e9a1031ca9&v=4',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Importante para Docker: escuchar en 0.0.0.0
  await app.listen(envs.port, '0.0.0.0');

  logger.log(`Full Shop Monolito running on port ${envs.port}`);
}
bootstrap();
