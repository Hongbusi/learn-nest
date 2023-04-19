import { Injectable } from '@nestjs/common'
import type { Cat } from './interfaces/cat.interface'

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = []

  create(cat: Cat) {
    this.cats.push(cat)
    return 'Created.'
  }

  findAll(): Cat[] {
    return this.cats
  }
}
