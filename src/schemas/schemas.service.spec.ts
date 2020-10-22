import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from 'nestjs-typegoose';
import { SchemasService } from './schemas.service';

describe('SchemasService', () => {
  let service: SchemasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchemasService,
        {
          provide: getModelToken('Schema'),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SchemasService>(SchemasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
