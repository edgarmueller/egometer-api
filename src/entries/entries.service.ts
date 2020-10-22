import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { Entry } from './entry';
import { MetersService } from '../meters/meters.service';

export interface FilterQuery {
  year?: number;
  week?: number;
}

@Injectable()
export class EntriesService {
  constructor(
    @InjectModel(Entry)
    private readonly entryModel: ReturnModelType<typeof Entry>,
    private readonly metersService: MetersService,
  ) {}

  async create(createEntryDto: Entry): Promise<Entry> {
    const { meterId } = createEntryDto;
    // 1. check if meter exist
    const meter = await this.metersService.findById(meterId);
    if (!meter) {
      // TODO
      throw new Error('meter not found');
    }
    const createdEntry = new this.entryModel(createEntryDto);
    return await createdEntry.save();
  }

  // TODO
  async findAll({ year, week }: FilterQuery): Promise<Entry[] | null> {
    let query = {};
    if (year) {
      query = {
        date: {
          $gte: new Date(year || new Date().getFullYear(), 0, 1).toISOString(),
          $lte: new Date().toISOString(),
        },
      };
    }
    if (week) {
      year = year || new Date().getFullYear();
      const d = new Date(year, 0, 1);
      const w = d.getTime() + 604800000 * (week - 1);
      console.log(w);
      query = {
        date: {
          $gte: new Date(w).toISOString(),
          $lte: new Date(w + 518400000).toISOString(),
        },
      };
    }
    return await this.entryModel.find(query).exec();
  }
}
