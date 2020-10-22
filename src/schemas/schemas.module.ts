import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { SchemasController } from './schemas.controller';
import { SchemasService } from './schemas.service';
import { Schema } from './schema';

@Module({
    imports: [TypegooseModule.forFeature([Schema])],
    controllers: [SchemasController],
    providers: [SchemasService],
    exports: [SchemasService]
})
export class SchemasModule {}
