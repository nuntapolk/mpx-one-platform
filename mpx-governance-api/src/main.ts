import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AllExceptionsFilter } from './common/filters/http-exception.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { AuditInterceptor } from './common/interceptors/audit.interceptor'
import { AuditTrailService } from './modules/audit-trail/audit-trail.service'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
    credentials: true,
  })

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new AllExceptionsFilter())
  const auditService = app.get(AuditTrailService)
  app.useGlobalInterceptors(new LoggingInterceptor(), new AuditInterceptor(auditService))

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MPX-ONE Governance API')
    .setDescription('Enterprise Governance Platform — IT, AI, Data, Risk & Regulatory Mapping')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addServer('http://localhost:4000', 'Local')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  })

  const port = process.env.PORT || 4000
  await app.listen(port)
  console.log(`MPX Governance API running on http://localhost:${port}`)
  console.log(`Swagger UI: http://localhost:${port}/api/docs`)
}
bootstrap()
