import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { TaskTimelog } from '../schemas/task-time-log.schema';

@Injectable()
export class TaskTimelogRepository {
  constructor(
    @InjectModel(TaskTimelog.name) private readonly taskTimelogModel: Model<TaskTimelog>,
  ) {}

  create(data?: unknown) {
    return new this.taskTimelogModel(data);
  }

  async save(taskTimelog: TaskTimelog, options?: { session?: ClientSession }) {
    if (!taskTimelog.isNew && !taskTimelog.isModified()) return taskTimelog;

    return taskTimelog.save({ session: options?.session });
  }
}
