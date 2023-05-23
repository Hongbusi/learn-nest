import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find()
  }

  findOne(name: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { name } })
  }

  remove(id: number) {
    return this.userRepository.delete(id)
  }
}
