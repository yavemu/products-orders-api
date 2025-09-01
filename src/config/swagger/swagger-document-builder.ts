import { DocumentBuilder } from '@nestjs/swagger';

export class SwaggerDocumentBuilder {
  static build() {
    return new DocumentBuilder()
      .setTitle('My API')
      .setDescription('API documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using Bearer token',
        },
        'JWT-auth',
      )
      .build();
  }
}
