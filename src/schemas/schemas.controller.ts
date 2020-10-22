import { Controller, Get } from '@nestjs/common';
import { SchemasService } from './schemas.service';
import { GetSchemaDto } from './dto/get-schema.dto';

@Controller('schemas')
export class SchemasController {
  constructor(private readonly schemasService: SchemasService) {}

  @Get()
  async getSchemas(): Promise<GetSchemaDto[] | null> {
    const schemas = await this.schemasService.findAll();
    return schemas.map(GetSchemaDto.fromDocument);
  }
}
