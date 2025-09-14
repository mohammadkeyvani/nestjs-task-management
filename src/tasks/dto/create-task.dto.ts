import { IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../task-status.enum';
import { Expose } from 'class-transformer';

export class CreateTaskDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}

export class CreateTaskResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  status: TaskStatus;
}
