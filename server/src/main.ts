import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule, {
      // httpsOptions,
      cors: true,
    });
    app.enableCors();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    // const config = new DocumentBuilder().setTitle('API').setVersion('1.0.0').build(); // openapi info
    // const document = SwaggerModule.createDocument(app, config);
    // SwaggerModule.setup('/api/docs', app, document);
    await app.listen(PORT, () => console.log(`Server started on port - ${PORT}`));
  } catch (error) {
    console.log(error);
  }
}
bootstrap();
