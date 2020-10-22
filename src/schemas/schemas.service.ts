import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import Ajv, { ErrorObject } from 'ajv';
import { Schema } from './schema';

@Injectable()
export class SchemasService {

  constructor(
    @InjectModel(Schema) private readonly schemaModel: ReturnModelType<typeof Schema>
  ) {
  }

  async create(createSchemaDto: Schema): Promise<Schema> {
    const createdSchema = new this.schemaModel(createSchemaDto);
    return await createdSchema.save();
  }

  async findAll(): Promise<Schema[] | null> {
    return await this.schemaModel.find().exec();
  }

  async findById(id: string): Promise<Schema> {
      const schema = await this.schemaModel.findById(id);
      return schema;
  }

  async validate(schema: Schema, value: any): Promise<Array<ErrorObject>>  {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(value);
    return valid ? [] : validate.errors;
  }
}
