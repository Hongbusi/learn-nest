import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'
import * as packageConfig from '../package.json'

export function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle(packageConfig.name)
    .setDescription(packageConfig.description)
    .setVersion(packageConfig.version)
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('/api', app, document)
  console.info(`API Documentation: http://localhost:${process.env.PORT}/api`)
}
