import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { TaskStatus } from '../task-status.enum';

// ArgumentMetadata is optional parameter ---metadata

export class TaskStatusValidationPipe implements PipeTransform {
  readonly allowedStatues = [
    TaskStatus.OPEN,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
  ];
  transform(value: any) {
    value = value.toUpperCase();
    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`${value} is an invalid status`);
    }
    return value;
  }

  private isStatusValid(status: any) {
    const index = this.allowedStatues.indexOf(status);
    return index !== -1;
  }
}
