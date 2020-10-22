import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from 'nestjs-typegoose';
import { MetersController } from './meters.controller';
import { MetersService } from './meters.service';

describe('MetersController', () => {
  let controller: MetersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetersController],
      providers: [
        MetersService,
        {
          provide: getModelToken('Meter'),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<MetersController>(MetersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
