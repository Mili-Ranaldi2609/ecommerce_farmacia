import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import basicAuth from 'express-basic-auth';
import { envs } from './config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Full Shop Monolito');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', {
    exclude: [{
      path: '',
      method: RequestMethod.GET
    }]
  });

  app.use(
    [envs.swaggerPath, `${envs.swaggerPath}-json`],
    basicAuth({
      users: {
        admin: envs.swaggerPassword
      },
      challenge: true,
    })
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true, 
  });

  const config = new DocumentBuilder()
    .setTitle('API Full Shop Documentation')
    .setDescription('[ Base URL:  ]')
    .setVersion('1.0')
    .addSecurity('bearerAuth', {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter your Bearer token in the format: Bearer <token>'
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Backend Generator',
    customfavIcon: 'https://avatars.githubusercontent.com/u/185267919?s=400&u=7d74f9c123b27391d3f11da2815de1e9a1031ca9&v=4',
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
    })
  );

  await app.listen(envs.port);

  logger.log(`Full Shop Monolito running on port ${envs.port}`);
}
bootstrap();
