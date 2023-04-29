import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { setupSwagger } from './swagger'
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter'
import { WrapResponseInterceptor } from './common/interceptors/wrap-response/wrap-response.interceptor'
import { TimeoutInterceptor } from './common/interceptors/timeout/timeout.interceptor'

declare const module: any

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(
    new WrapResponseInterceptor(),
    new TimeoutInterceptor(),
  )

  const enableSwagger = process.env.ENABLE_DOCUMENTATION !== 'false'

  if (enableSwagger)
    setupSwagger(app)

  await app.listen(3000)

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}
bootstrap()
