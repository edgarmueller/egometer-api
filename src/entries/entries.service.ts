import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType, DocumentType } from '@typegoose/typegoose';
import toNumber from 'lodash/toNumber';
import { Entry } from './entry';
import { MetersService } from '../meters/meters.service';

export interface FilterQuery {
  year?: number;
  week?: number;
}

const toEntry = (entryDoc: DocumentType<Entry>): Entry => {
  return {
    ...entryDoc.toObject(),
    id: entryDoc._id,
  };
};

@Injectable()
export class EntriesService {
  constructor(
    @InjectModel(Entry)
    private readonly entryModel: ReturnModelType<typeof Entry>,
    private readonly metersService: MetersService,
  ) {}

  async upsert(createEntryDto: Entry): Promise<Entry> {
    const { meterId } = createEntryDto;
    // 1. check if meter exist
    const meter = await this.metersService.findById(meterId);
    if (!meter) {
      // TODO
      throw new Error('meter not found');
    }
    const entry = await this.entryModel
      .findOneAndUpdate(
        { date: createEntryDto.date, meterId: createEntryDto.meterId },
        createEntryDto,
        { new: true, upsert: true },
      )
      .exec();
    return toEntry(entry);
  }

  async findAll({ year, week }: FilterQuery): Promise<Entry[] | null> {
    let query = {};
    if (year) {
      const y = toNumber(year || new Date().getFullYear());
      query = {
        date: {
          $gte: new Date(y, 0, 1).toISOString(),
          $lte: new Date(y + 1, 0, 1).toISOString(),
        },
      };
    }
    if (week) {
      year = year || new Date().getFullYear();
      const d = new Date(year, 0, 1);
      const w = d.getTime() + 604800000 * (week - 1);
      query = {
        date: {
          $gte: new Date(w).toISOString(),
          $lte: new Date(w + 518400000).toISOString(),
        },
      };
    }
    const entryDocs = await this.entryModel.find(query).exec();
    return entryDocs.map(toEntry);
  }

  async deleteById(entryId: string): Promise<Entry> {
    const entry = await this.entryModel.findOne({ _id: entryId }).exec();
    await this.entryModel.deleteOne({ _id: entryId }).exec();
    return toEntry(entry);
  }
}
