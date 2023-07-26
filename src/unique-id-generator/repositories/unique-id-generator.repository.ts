import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UniqueIdGenerator } from '../schema/unique-id-generator.schema';

@Injectable()
export class UniqueIdGeneratorRepository {
  constructor(
    @InjectModel(UniqueIdGenerator.name) private readonly model: Model<UniqueIdGenerator>,
  ) {}

  async getNextTaskId() {
    const result = await this.model.findOneAndUpdate(
      { index: 1 },
      { $inc: { taskId: 1 } },
      { new: true, upsert: true },
    );
    return result.taskId;
  }
}
