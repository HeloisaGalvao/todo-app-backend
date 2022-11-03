import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getCustomRepositoryToken, getRepositoryToken } from '@nestjs/typeorm';
import exp from 'constants';
import { resolve } from 'path';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoEntity } from './entity/todo.entity';
import { TodoService } from './todo.service';

const todoEntityList: TodoEntity[] = [
  new TodoEntity({ task: 'task-1', isDone: 0 }),
  new TodoEntity({ task: 'task-2', isDone: 0 }),
  new TodoEntity({ task: 'task-3', isDone: 0 }),
];

const updateTodoEntityItem = new TodoEntity({ task: 'task-1', isDone: 1 });

describe('TodoService', () => {
  let todoService: TodoService;
  let todoRepository: Repository<TodoEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(TodoEntity),
          useValue: {
            find: jest.fn().mockResolvedValue(todoEntityList),
            findOneBy: jest.fn().mockResolvedValue(todoEntityList[0]),
            create: jest.fn().mockReturnValue(todoEntityList[0]),
            merge: jest.fn().mockReturnValue(updateTodoEntityItem),
            save: jest.fn().mockResolvedValue(todoEntityList[0]),
            softDelete: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    todoService = module.get<TodoService>(TodoService);
    todoRepository = module.get<Repository<TodoEntity>>(
      getRepositoryToken(TodoEntity),
    );
  });

  it('should be defined', () => {
    expect(todoService).toBeDefined();
    expect(todoRepository).toBeDefined();
  });

  describe('findAll', () => {
    it('shoul return a todo list entity sucessfully', async () => {
      const result = await todoService.findAll();

      expect(result).toEqual(todoEntityList);
      expect(todoRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', () => {
      jest.spyOn(todoRepository, 'find').mockRejectedValueOnce(new Error());

      expect(todoService.findAll()).rejects.toThrowError();
    });
  });

  describe('findOneOrFail', () => {
    it('should return a todo item successfully', async () => {
      const result = await todoService.findOneOrFail('1');

      expect(result).toEqual(todoEntityList[0]);
      expect(todoRepository.findOneBy).toHaveBeenCalledTimes(1);
    });

    it('should throw an not found exception', () => {
      jest
        .spyOn(todoRepository, 'findOneBy')
        .mockRejectedValueOnce(new Error());

      expect(todoService.findOneOrFail('1')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a todo entity item sucessfully', async () => {
      const data: CreateTodoDto = {
        task: 'task=1',
        isDone: 0,
      };
      const result = await todoService.create(data);

      expect(result).toEqual(todoEntityList[0]);
      expect(todoRepository.create).toHaveBeenCalledTimes(1);
      expect(todoRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', () => {
      const data: CreateTodoDto = {
        task: 'task=1',
        isDone: 0,
      };
      jest.spyOn(todoRepository, 'save').mockRejectedValueOnce(new Error());

      expect(todoService.create(data)).rejects.toThrowError();
    });
  });

  describe('update', () => {
    it('should update a todo entity item successfully', async () => {
      const data: UpdateTodoDto = {
        task: 'task-1',
        isDone: 1,
      };
      jest
        .spyOn(todoRepository, 'save')
        .mockResolvedValueOnce(updateTodoEntityItem);

      const result = await todoService.update('1', data);

      expect(result).toEqual(updateTodoEntityItem);
    });

    it('should throw a not found exception', () => {
      const data: UpdateTodoDto = {
        task: 'task-1',
        isDone: 1,
      };
      jest
        .spyOn(todoRepository, 'findOneBy')
        .mockRejectedValueOnce(new Error());

      expect(todoService.update('1', data)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw an exception', () => {
      const data: UpdateTodoDto = {
        task: 'task-1',
        isDone: 1,
      };
      jest.spyOn(todoRepository, 'save').mockRejectedValueOnce(new Error());

      expect(todoService.update('1', data)).rejects.toThrowError();
    });
  });

  describe('deleteById', () => {
    it('should delete a todo item successfully', async () => {
      const result = await todoService.deleteById('1');

      expect(result).toBeUndefined();
      expect(todoRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(todoRepository.softDelete).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception', () => {
      const data: UpdateTodoDto = {
        task: 'task-1',
        isDone: 1,
      };
      jest
        .spyOn(todoRepository, 'findOneBy')
        .mockRejectedValueOnce(new Error());

      expect(todoService.deleteById('1')).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw an exception', () => {
      jest
        .spyOn(todoRepository, 'softDelete')
        .mockRejectedValueOnce(new Error());

      expect(todoService.deleteById('1')).rejects.toThrowError();
    });
  });
});
