/* eslint-disable no-console */
import { Body, Controller, DefaultValuePipe, Get, HttpStatus, Param, ParseIntPipe, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common'
import { RolesGuard } from '../common/guards/roles.guard'
import { Role } from '../enums/role.enum'
import { LoggingInterceptor } from '../common/interceptor/logging.interceptor'
import type { CreateCatDto } from './dto/create-cat-dto'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CatsService } from './cats.service'
import type { Cat } from './interfaces/cat.interface'
import { ValidationPipe } from './validation.pipe'
import { Roles } from './roles.decorator'

@Controller('cats')
@UseInterceptors(LoggingInterceptor)
export default class CatsController {
  constructor(private catsService: CatsService) {}
  @Post()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  async create(@Body(new ValidationPipe()) createCatDto: CreateCatDto) {
    return this.catsService.create(createCatDto)
  }

  @Get()
  async findAll(@Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number): Promise<Cat[]> {
    return this.catsService.findAll({ page })
  }

  @Get(':id')
  findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): string {
    console.log(id)
    return `This action returns a #${id} cat`
  }
}
