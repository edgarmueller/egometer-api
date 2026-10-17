import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { daysBetween } from '../common/calendar-date.js';
import { MetersService } from '../meters/meters.service.js';
import { validateEntryValue } from '../meters/meter-types.js';
import { Entry, EntryDocument } from './entry.schema.js';
import { FindEntriesQuery } from './dto/entry.dto.js';

export const MAX_RANGE_DAYS = 366;

@Injectable()
export class EntriesService {
  constructor(
    @InjectModel(Entry.name) private readonly entryModel: Model<Entry>,
    private readonly metersService: MetersService,
  ) {}

  findInRange(
    userId: string,
    { from, to, meterId }: FindEntriesQuery,
  ): Promise<EntryDocument[]> {
    const days = daysBetween(from, to);
    if (days < 0) {
      throw new BadRequestException('from must not be after to');
    }
    if (days >= MAX_RANGE_DAYS) {
      throw new BadRequestException(
        `the range must not exceed ${MAX_RANGE_DAYS} days`,
      );
    }
    return this.entryModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: from, $lte: to },
        ...(meterId && { meterId: new Types.ObjectId(meterId) }),
      })
      .sort({ date: 1 })
      .exec();
  }

  /** Creates or replaces the meter's entry for the given day. */
  async upsert(
    userId: string,
    meterId: Types.ObjectId,
    date: string,
    value: unknown,
  ): Promise<EntryDocument> {
    const meter = await this.metersService.findOne(userId, meterId);
    const error = validateEntryValue(meter, value);
    if (error) {
      throw new BadRequestException(error);
    }
    return this.entryModel
      .findOneAndUpdate(
        { meterId: meter._id, date },
        { userId: meter.userId, value },
        { upsert: true, returnDocument: 'after', runValidators: true },
      )
      .orFail()
      .exec();
  }

  async remove(
    userId: string,
    meterId: Types.ObjectId,
    date: string,
  ): Promise<void> {
    const { deletedCount } = await this.entryModel
      .deleteOne({ userId: new Types.ObjectId(userId), meterId, date })
      .exec();
    if (deletedCount === 0) {
      throw new NotFoundException('Entry not found');
    }
  }
}
