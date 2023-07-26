import { Injectable } from '@nestjs/common';
import { getUser } from 'src/utils/request-store/request-store';
import { TaskPostDto } from '../dtos/task-post.dto';
import { TaskHistoryRepository } from '../repositories/task-history.repository';
import { TaskTimelogRepository } from '../repositories/task-timelog.repository';
import { TaskRepository } from '../repositories/task.repository';
import { TaskHistoryTypeEnum } from '../schemas/task-history.schema';
import { TaskStatusEnum } from '../schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(
    private readonly taskRepo: TaskRepository,
    private readonly taskTimelogRepo: TaskTimelogRepository,
    private readonly taskHistoryRepo: TaskHistoryRepository,
  ) {}

  async createTask(body: TaskPostDto) {
    const task = await this.taskRepo.save(this.taskRepo.create(body));

    const taskHistory = this.taskHistoryRepo.create();
    taskHistory.taskId = task._id;
    taskHistory.userId = getUser()?._id;
    taskHistory.type = TaskHistoryTypeEnum.CREATED;
    taskHistory.createdAt = new Date();
    await this.taskHistoryRepo.save(taskHistory);

    if (body.status === TaskStatusEnum.IN_PROGRESS) {
      const taskTimelog = this.taskTimelogRepo.create({
        taskId: task._id,
        startAt: new Date(),
        userId: getUser()?._id,
      });
      await this.taskTimelogRepo.save(taskTimelog);
    }

    return task;
  }
}
