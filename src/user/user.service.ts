import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { Repository } from 'typeorm'
import type { CreateUserDto } from './dto/create-user.dto'
import type { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User()
    user.firstName = createUserDto.firstName
    user.lastName = createUserDto.lastName

    return this.usersRepository.save(user)
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id })
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update(id, updateUserDto)
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id)
  }
}
