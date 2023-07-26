import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UniqueIdGeneratorRepository } from './repositories/unique-id-generator.repository';
import { UniqueIdGenerator, UniqueIdGeneratorSchema } from './schema/unique-id-generator.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UniqueIdGenerator.name, schema: UniqueIdGeneratorSchema }]),
  ],
  providers: [UniqueIdGeneratorRepository],
  exports: [UniqueIdGeneratorRepository],
})
export class UniqueIdGeneratorModule {}
