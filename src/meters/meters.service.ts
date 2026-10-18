import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Entry } from '../entries/entry.schema.js';
import { Meter, MeterDocument } from './meter.schema.js';
import { CreateMeterDto, UpdateMeterDto } from './dto/meter.dto.js';
import { DEFAULT_ACTIVITIES, type MeterType } from './meter-types.js';

/** Rejects fields that don't apply to the meter's type. */
function checkFieldsForType(type: MeterType, dto: UpdateMeterDto) {
  if (dto.options !== undefined && type !== 'activities') {
    throw new BadRequestException(
      'options are only allowed for activities meters',
    );
  }
  const hasGoal = (goal?: number | null) => goal !== undefined && goal !== null;
  if (
    (hasGoal(dto.dailyGoal) || hasGoal(dto.weeklyGoal)) &&
    type !== 'number'
  ) {
    throw new BadRequestException('goals are only allowed for number meters');
  }
}

/** Copies the given fields, turning null into "remove the field". */
function applyUpdate(meter: MeterDocument, dto: UpdateMeterDto) {
  for (const [key, value] of Object.entries(dto)) {
    if (value === undefined) {
      continue;
    }
    meter.set(key, value === null ? undefined : value);
  }
}

@Injectable()
export class MetersService {
  constructor(
    @InjectModel(Meter.name) private readonly meterModel: Model<Meter>,
    @InjectModel(Entry.name) private readonly entryModel: Model<Entry>,
  ) {}

  findAll(userId: string): Promise<MeterDocument[]> {
    return this.meterModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: 1 })
      .exec();
  }

  /** The user's meter; other users' meters are reported as not found. */
  async findOne(
    userId: string,
    meterId: string | Types.ObjectId,
  ): Promise<MeterDocument> {
    const meter = await this.meterModel
      .findOne({
        _id: new Types.ObjectId(meterId),
        userId: new Types.ObjectId(userId),
      })
      .exec();
    if (!meter) {
      throw new NotFoundException('Meter not found');
    }
    return meter;
  }

  create(userId: string, dto: CreateMeterDto): Promise<MeterDocument> {
    checkFieldsForType(dto.type, dto);
    const meter = new this.meterModel({
      userId: new Types.ObjectId(userId),
      name: dto.name,
      type: dto.type,
    });
    applyUpdate(meter, { ...dto, type: undefined } as UpdateMeterDto);
    if (dto.type === 'activities' && !dto.options) {
      meter.options = DEFAULT_ACTIVITIES;
    }
    return meter.save();
  }

  async update(
    userId: string,
    meterId: string | Types.ObjectId,
    dto: UpdateMeterDto,
  ): Promise<MeterDocument> {
    const meter = await this.findOne(userId, meterId);
    checkFieldsForType(meter.type, dto);
    applyUpdate(meter, dto);
    return meter.save();
  }

  /** Deletes the meter together with its entries. */
  async remove(
    userId: string,
    meterId: string | Types.ObjectId,
  ): Promise<void> {
    const meter = await this.findOne(userId, meterId);
    await this.entryModel.deleteMany({ meterId: meter._id }).exec();
    await meter.deleteOne();
  }
}
