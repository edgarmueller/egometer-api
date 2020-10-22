import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from 'nestjs-typegoose';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';
import { MetersService } from '../meters/meters.service';
import { SchemasService } from '../schemas/schemas.service';

describe('EntriesController', () => {
  let controller: EntriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntriesController],
      providers: [
        EntriesService,
        MetersService,
        SchemasService,
        {
          provide: getModelToken('Entry'),
          useValue: {},
        },
        {
          provide: getModelToken('Meter'),
          useValue: {},
        },
        {
          provide: getModelToken('Schema'),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<EntriesController>(EntriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
