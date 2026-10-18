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

const isSet = (value: unknown) => value !== undefined && value !== null;

/** Rejects fields that don't apply to the meter's type. */
function checkFieldsForType(type: MeterType, dto: UpdateMeterDto) {
  if (dto.options !== undefined && type !== 'activities') {
    throw new BadRequestException(
      'options are only allowed for activities meters',
    );
  }
  if (isSet(dto.dailyGoal) && type !== 'number') {
    throw new BadRequestException(
      'daily goals are only allowed for number meters',
    );
  }
  if (isSet(dto.weeklyGoal) && type === 'activities') {
    throw new BadRequestException(
      'activities meters have goals per tag, see tagGoals',
    );
  }
  if (isSet(dto.tagGoals) && type !== 'activities') {
    throw new BadRequestException(
      'tag goals are only allowed for activities meters',
    );
  }
}

/** Rejects goals of unknown or repeated tags. */
function checkTagGoals(meter: MeterDocument) {
  const tags = (meter.tagGoals ?? []).map((goal) => goal.tag);
  if (new Set(tags).size !== tags.length) {
    throw new BadRequestException('each tag can only have one goal');
  }
  const unknown = tags.filter((tag) => !meter.options?.includes(tag));
  if (unknown.length > 0) {
    throw new BadRequestException(
      `goals of tags that aren't options of the meter: ${unknown.join(', ')}`,
    );
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
    checkTagGoals(meter);
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
    if (dto.options && dto.tagGoals === undefined && meter.tagGoals) {
      // removing a tag removes its goal
      meter.tagGoals = meter.tagGoals.filter((goal) =>
        dto.options!.includes(goal.tag),
      );
    }
    checkTagGoals(meter);
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
