import { DocumentType } from '@typegoose/typegoose';
import { Schema } from '../schema';

export class GetSchemaDto {
  id: string;

  name: string;

  userId?: string;

  schema: any;

  static fromDocument(doc: DocumentType<Schema>): GetSchemaDto {
    const schema = doc.toObject();
    return {
      id: schema._id,
      name: schema.name,
      userId: schema.userId,
      schema: schema.jsonSchema,
    };
  }
}
