import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import type { CreateUserDto } from './dto/create-user.dto'
import { UserController } from './user.controller'
import { UserService } from './user.service'

const createUserDto: CreateUserDto = {
  firstName: 'firstName #1',
  lastName: 'lastName #1',
}

describe('UserController', () => {
  let usersController: UserController
  let usersService: UserService

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: UserService,
          useValue: {
            create: jest
              .fn()
              .mockImplementation((user: CreateUserDto) =>
                Promise.resolve({ id: '1', ...user }),
              ),
            findAll: jest.fn().mockResolvedValue([
              {
                firstName: 'firstName #1',
                lastName: 'lastName #1',
              },
              {
                firstName: 'firstName #2',
                lastName: 'lastName #2',
              },
            ]),
            findOne: jest.fn().mockImplementation((id: string) =>
              Promise.resolve({
                firstName: 'firstName #1',
                lastName: 'lastName #1',
                id,
              }),
            ),
            remove: jest.fn(),
          },
        },
      ],
    }).compile()

    usersController = app.get<UserController>(UserController)
    usersService = app.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(usersController).toBeDefined()
  })

  describe('create()', () => {
    it('should create a user', () => {
      usersController.create(createUserDto)
      expect(usersController.create(createUserDto)).resolves.toEqual({
        id: '1',
        ...createUserDto,
      })
      expect(usersService.create).toHaveBeenCalledWith(createUserDto)
    })
  })

  describe('findAll()', () => {
    it('should find all users ', () => {
      usersController.findAll()
      expect(usersService.findAll).toHaveBeenCalled()
    })
  })

  describe('findOne()', () => {
    it('should find a user', () => {
      expect(usersController.findOne(1)).resolves.toEqual({
        firstName: 'firstName #1',
        lastName: 'lastName #1',
        id: 1,
      })
      expect(usersService.findOne).toHaveBeenCalled()
    })
  })

  describe('remove()', () => {
    it('should remove the user', () => {
      usersController.remove('2')
      expect(usersService.remove).toHaveBeenCalled()
    })
  })
})
