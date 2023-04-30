import { Test, TestingModule } from '@nestjs/testing'
import { Connection, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { NotFoundException } from '@nestjs/common'
import { CoffeesService } from './coffees.service'
import { Coffee } from './entities/coffee.entity'
import { Flavor } from './entities/flavor.entity'

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>
function createMockRepository<T = any>(): MockRepository<T> {
  return {
    findOne: jest.fn(),
    create: jest.fn(),
  }
}

describe('CoffeesService', () => {
  let service: CoffeesService
  let createRepository: MockRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoffeesService,
        { provide: Connection, useValue: {} },
        { provide: getRepositoryToken(Flavor), useValue: createMockRepository() },
        { provide: getRepositoryToken(Coffee), useValue: createMockRepository() },
      ],
    }).compile()

    service = module.get<CoffeesService>(CoffeesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findOne', () => {
    describe('when coffee with id exists', () => {
      it('should return the coffee object', async () => {
        const coffeeId = '1'
        const expectedCoffee = {}

        createRepository.findOne.mockReturnValue(expectedCoffee)
        const coffee = await service.findOne(coffeeId)
        expect(coffee).toEqual(expectedCoffee)
      })
    })

    describe('otherwise', () => {
      it('should throw the "NotFoundException"', async () => {
        const coffeeId = '1'

        createRepository.findOne.mockReturnValue(undefined)

        try {
          await service.findOne(coffeeId)
        }
        catch (err) {
          expect(err).toBeInstanceOf(NotFoundException)
          expect(err.message).toEqual(`Coffee #${coffeeId} not found`)
        }
      })
    })
  })
})
