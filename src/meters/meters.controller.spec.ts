import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from 'nestjs-typegoose';
import { ObjectId } from 'mongodb';
import { MetersController } from './meters.controller';
import { MetersService } from './meters.service';
import { NotFoundException } from '@nestjs/common';

describe('MetersController', () => {
  let controller: MetersController;
  let service: MetersService;

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
    service = module.get<MetersService>(MetersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return NotFound if meter id is not found', async () => {
    const meterId = String(new ObjectId()); 
    jest.spyOn(service, 'delete').mockResolvedValue(false);
    await expect(controller.deleteMeter(meterId)).rejects.toThrowError(NotFoundException)
  })
});
