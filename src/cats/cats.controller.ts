/* eslint-disable no-console */
import { Body, Controller, DefaultValuePipe, Get, HttpStatus, Param, ParseIntPipe, Post, Query } from '@nestjs/common'
import type { CreateCatDto } from './dto/create-cat-dto'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CatsService } from './cats.service'
import type { Cat } from './interfaces/cat.interface'
import { ValidationPipe } from './validation.pipe'

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}
  @Post()
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
