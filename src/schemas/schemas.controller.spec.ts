import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from 'nestjs-typegoose';
import { SchemasController } from './schemas.controller';
import { SchemasService } from './schemas.service';

describe('SchemasController', () => {
  let controller: SchemasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchemasController],
      providers: [
        SchemasService,
        {
          provide: getModelToken('Schema'),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SchemasController>(SchemasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
