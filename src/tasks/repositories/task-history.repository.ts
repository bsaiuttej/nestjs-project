import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaskHistory } from '../schemas/task-history.schema';

@Injectable()
export class TaskHistoryRepository {
  constructor(
    @InjectModel(TaskHistory.name) private readonly taskHistoryModel: Model<TaskHistory>,
  ) {}

  create(data?: unknown) {
    return new this.taskHistoryModel(data);
  }

  async save(taskHistory: TaskHistory) {
    if (!taskHistory.isNew && !taskHistory.isModified()) return taskHistory;

    return taskHistory.save();
  }

  insert(data: unknown) {
    return this.taskHistoryModel.create(data);
  }
}
