import { Test, TestingModule } from '@nestjs/testing';
import { MetersService } from './meters.service';
import { getModelToken } from 'nestjs-typegoose';
import { ObjectId } from 'mongodb';

describe('MetersService', () => {
  let service: MetersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetersService,
        {
          provide: getModelToken('Meter'),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<MetersService>(MetersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
