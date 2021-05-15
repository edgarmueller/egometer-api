import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType, DocumentType } from '@typegoose/typegoose';
import toNumber from 'lodash/toNumber';
import { Entry } from './entry';
import { MetersService } from '../meters/meters.service';
import { start } from 'repl';
import { query } from 'express';

export interface FilterQuery {
  year?: number;
  week?: number;
  month?: number;
}

const toEntry = (entryDoc: DocumentType<Entry>): Entry => {
  return {
    ...entryDoc.toObject(),
    id: entryDoc._id,
  };
};

export function weekToDate(year, week) {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dayOfWeek = simple.getDay();
  const isoWeekStart = simple;
  if (dayOfWeek <= 4) {
    isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return isoWeekStart;
}

const onlyDateAsString = date =>
  date.toISOString().substr(0, 'YYYY-MM-DD'.length);

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

  async findAll({ year, week, month }: FilterQuery): Promise<Entry[] | null> {
    let query = {};
    if (year) {
      query = this.buildQueryByYear(year);
    }
    year = year || new Date().getFullYear();
    if (month) {
      query = this.buildQueryByMonth(year, month);
    } else if (week) {
      query = this.buildQueryByWeek(year, week);
    }
    const entryDocs = await this.entryModel.find(query).exec();
    return entryDocs.map(toEntry);
  }

  async deleteById(entryId: string): Promise<Entry> {
    const entry = await this.entryModel.findOne({ _id: entryId }).exec();
    await this.entryModel.deleteOne({ _id: entryId }).exec();
    return toEntry(entry);
  }

  private buildQueryByWeek(year: number, week: number) {
    const startDate = weekToDate(year, week);
    const endDate = new Date(startDate.getTime() + 518400000);
    return {
      date: {
        $gte: onlyDateAsString(startDate),
        $lte: onlyDateAsString(endDate),
      },
    };
  }

  private buildQueryByMonth(year: number, month: number) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month - 1, daysInMonth, 0, 0, 0));
    return {
      date: {
        $gte: onlyDateAsString(startDate),
        $lte: onlyDateAsString(endDate),
      },
    };
  }

  private buildQueryByYear(year: number) {
    const y = toNumber(year || new Date().getFullYear());
    return {
      date: {
        $gte: onlyDateAsString(new Date(y, 0, 1)),
        $lte: onlyDateAsString(new Date(y + 1, 0, 1)),
      },
    };
  }
}
