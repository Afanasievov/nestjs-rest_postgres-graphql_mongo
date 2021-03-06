import { Op } from 'sequelize';
import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.model';

@Table({ timestamps: false })
export class Task extends Model {
  static logger = new Logger('TaskModel');

  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column
  title: string;

  @Column
  description: string;

  @Column
  status: TaskStatus;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  static async findAllWithFilters(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;

    const where = { [Op.and]: [] };
    where[Op.and].push({ userId: user.id });
    const searchOptions = { [Op.and]: [] };
    if (status) {
      searchOptions[Op.and].push({ status });
    }
    if (search) {
      searchOptions[Op.and].push({
        [Op.or]: [{ title: { [Op.substring]: search } }, { description: { [Op.substring]: search } }],
      });
    }
    if (searchOptions[Op.and].length) {
      where[Op.and].push(searchOptions);
    }

    try {
      return this.findAll({ where });
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user '${user.username}', DTO: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
