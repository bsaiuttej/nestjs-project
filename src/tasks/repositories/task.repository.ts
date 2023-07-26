import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UniqueIdGeneratorRepository } from 'src/unique-id-generator/repositories/unique-id-generator.repository';
import { Task } from '../schemas/task.schema';

@Injectable()
export class TaskRepository {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    private readonly uniqueIdGeneratorRepo: UniqueIdGeneratorRepository,
  ) {}

  create(data?: unknown) {
    return new this.taskModel(data);
  }

  async save(task: Task) {
    if (!task.isNew && !task.isModified()) return task;

    if (task.isNew) {
      const taskId = await this.uniqueIdGeneratorRepo.getNextTaskId();
      task.taskId = taskId.toString();
    }

    return task.save();
  }
}
