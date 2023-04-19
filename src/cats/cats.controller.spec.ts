import { Test } from '@nestjs/testing'
import CatsController from './cats.controller'
import { CatsService } from './cats.service'

describe('CatsController', () => {
  let catsController: CatsController
  let catsService: CatsService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [CatsService],
    }).compile()

    catsService = moduleRef.get<CatsService>(CatsService)
    catsController = moduleRef.get<CatsController>(CatsController)
  })

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = [{ name: 'Test Cat', age: 5, breed: 'Test' }]
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result)

      expect(await catsController.findAll(1)).toBe(result)
    })
  })
})
