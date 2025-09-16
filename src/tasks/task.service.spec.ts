import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { AfterRecover, Repository } from 'typeorm';
import { Task } from './task.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { exec } from 'child_process';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Logger, NotFoundException } from '@nestjs/common';
import { User } from '../auth/user.entity';
import { CreateTaskDto, CreateTaskResponseDto } from './dto/create-task.dto';

const mockUser = { id: 12, username: 'test' } as User;

const mockTask = {
  title: 'Test task',
  description: 'test description',
} as Task;

type MockRepository<T = any> = Partial<
  Record<keyof Repository<Task>, jest.Mock>
>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
});

describe('TaskService', () => {
  let taskService: TasksService;
  let taskRepository: MockRepository<Task>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: createMockRepository<Task>(),
        },
      ],
    }).compile();

    taskService = module.get<TasksService>(TasksService);
    taskRepository = module.get<MockRepository<Task>>(getRepositoryToken(Task));
  });

  describe('getTasks', () => {
    it('gets all task ', async () => {
      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search query',
      };

      taskRepository.createQueryBuilder?.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await taskService.getTasks(filters, mockUser);
      expect(result).toEqual(mockUser);

      taskService.getTasks(filters, mockUser);

      expect(taskRepository.query);
    });
  });

  describe('getTaskById', () => {
    it('should return a task if found', async () => {
      taskRepository.findOne?.mockResolvedValue(mockTask);

      const result = await taskService.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: mockUser.id },
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      taskRepository.findOne?.mockResolvedValue(null);

      await expect(taskService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('should create a task and return the response DTO', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Title',
        description: 'Test Desc',
      };

      const newMock: Partial<Task> = {
        id: 1,
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: TaskStatus.IN_PROGRESS,
      };

      jest.spyOn(Task.prototype, 'save').mockImplementationOnce(function (
        this: Task,
      ) {
        this.id = 1;
        return Promise.resolve(this);
      });

      const result = await taskService.createTask(createTaskDto, mockUser);

      expect(result).toMatchObject({
        id: newMock.id,
        title: newMock.title,
        description: newMock.description,
      });
    });
  });

  describe('deleteTask', () => {
    it('calls taskRepository delete task ', async () => {
      taskRepository.delete?.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await taskService.deleteTask(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
    });

    it('throws an error as task could not be found!', () => {
      taskRepository.delete?.mockResolvedValue({ affected: 0 });
      expect(taskService.deleteTask(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Update tasks', () => {
    it('updates a task status', async () => {
      const save = jest.fn().mockResolvedValue(true);
      taskService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save,
      });

      expect(taskService.getTaskById).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
      const result = await taskService.updateTaskStatus(
        1,
        TaskStatus.IN_PROGRESS,
        mockUser,
      );
      expect(taskService.getTaskById).toHaveBeenCalledWith(1, mockUser);
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.IN_PROGRESS);
    });
  });
});
