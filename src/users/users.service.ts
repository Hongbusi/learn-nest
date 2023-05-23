import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HashingService } from 'src/hashing/hashing.service'
import { CreateUserDto } from './dto/create-user.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { name, password } = createUserDto

    const existingUser = await this.userRepository.findOne({
      where: [{ name }],
    })
    if (existingUser)
      throw new UnauthorizedException('User already exists')

    const hashedPassword = await this.hashingService.hash(password)
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    })
    return this.userRepository.save(user)
  }

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
