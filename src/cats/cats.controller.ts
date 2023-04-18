/* eslint-disable no-console */
import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import type { CreateCatDto } from './dto/create-cat-dto'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CatsService } from './cats.service'
import type { Cat } from './interfaces/cat.interface'

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto)
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    console.log(id)
    return `This action returns a #${id} cat`
  }
}
