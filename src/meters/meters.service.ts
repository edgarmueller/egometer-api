import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';
import { Meter } from './meter';
import { CreateMeterDto } from './dto/create-meter.dto';
import { PatchMeterDto } from './dto/patch-meter.dto';

@Injectable()
export class MetersService {
  constructor(
    @InjectModel(Meter)
    private readonly meterModel: ReturnModelType<typeof Meter>,
  ) {}

  async findByUserId(userId: string): Promise<Meter[]> {
    return this.meterModel
      .find({
        $or: [
          {
            userId,
          },
          {
            userId: {
              $exists: false,
            },
          },
        ],
      })
      .exec();
  }

  async findById(meterId: string): Promise<Meter | null> {
    return await this.meterModel.findById(new ObjectId(meterId)).exec();
  }

  async create(createMeterDto: CreateMeterDto): Promise<DocumentType<Meter>> {
    const createdMeter = new this.meterModel(createMeterDto);
    return await createdMeter.save();
  }

  async update(
    meterId: string,
    patchMeterDto: PatchMeterDto,
  ): Promise<DocumentType<Meter>> {
    const filter = {
      _id: new ObjectId(meterId),
    };
    await this.meterModel.findOneAndUpdate(filter, patchMeterDto);
    return await this.meterModel.findOne(filter);
  }

  async delete(
    meterId: string
  ): Promise<boolean> {
    const filter = {
      _id: new ObjectId(meterId),
    };
    const { ok } = await this.meterModel.deleteOne(filter);
    return ok === 1;
  }
}
