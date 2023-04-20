import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import type { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { UserService } from './user.service'

const userArray = [
  {
    firstName: 'firstName #1',
    lastName: 'lastName #1',
  },
  {
    firstName: 'firstName #2',
    lastName: 'lastName #2',
  },
]

const oneUser = {
  firstName: 'firstName #1',
  lastName: 'lastName #1',
}

describe('UserService', () => {
  let service: UserService
  let repository: Repository<User>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn().mockResolvedValue(userArray),
            findOneBy: jest.fn().mockResolvedValue(oneUser),
            save: jest.fn().mockResolvedValue(oneUser),
            remove: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
    repository = module.get<Repository<User>>(getRepositoryToken(User))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create()', () => {
    it('should successfully insert a user', () => {
      const oneUser = {
        firstName: 'firstName #1',
        lastName: 'lastName #1',
      }

      expect(
        service.create({
          firstName: 'firstName #1',
          lastName: 'lastName #1',
        }),
      ).resolves.toEqual(oneUser)
    })
  })

  describe('findAll()', () => {
    it('should return an array of users', async () => {
      const users = await service.findAll()
      expect(users).toEqual(userArray)
    })
  })

  describe('findOne()', () => {
    it('should get a single user', () => {
      const repoSpy = jest.spyOn(repository, 'findOneBy')
      expect(service.findOne(1)).resolves.toEqual(oneUser)
      expect(repoSpy).toBeCalledWith({ id: 1 })
    })
  })

  describe('remove()', () => {
    it('should call remove with the passed value', async () => {
      const removeSpy = jest.spyOn(repository, 'delete')
      const retVal = await service.remove('2')
      expect(removeSpy).toBeCalledWith('2')
      expect(retVal).toBeUndefined()
    })
  })
})
