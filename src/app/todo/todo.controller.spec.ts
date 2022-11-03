import { Test, TestingModule } from '@nestjs/testing';
import exp from 'constants';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoEntity } from './entity/todo.entity';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';

const todoEntityList: TodoEntity[] = [
  new TodoEntity({ id: '1', task: 'task-1', isDone: 0 }),
  new TodoEntity({ id: '2', task: 'task-2', isDone: 0 }),
  new TodoEntity({ id: '3', task: 'task-3', isDone: 0 }),
];

const newTodoEntity = new TodoEntity({ task: 'new-task', isDone: 0 });

const updateTodoEntity = new TodoEntity({ id: '1', task: 'task-1', isDone: 1 });

describe('TodoController', () => {
  let todoController: TodoController;
  let todoService: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(todoEntityList),
            create: jest.fn().mockResolvedValue(newTodoEntity),
            findOneOrFail: jest.fn().mockResolvedValue(todoEntityList[0]),
            update: jest.fn().mockResolvedValue(updateTodoEntity),
            deleteById: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    todoController = module.get<TodoController>(TodoController);
    todoService = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(todoController).toBeDefined();
  });

  describe('index', () => {
    it('should return a todo list entity successfully', async () => {
      const result = await todoController.index();

      expect(result).toEqual(todoEntityList);
    });

    it('should throw an exception ', () => {
      jest.spyOn(todoService, 'findAll').mockRejectedValueOnce(new Error());

      expect(todoController.index()).rejects.toThrowError();
    });
  });

  describe('store', () => {
    it('should create a new todo item successfully', async () => {
      const body: CreateTodoDto = {
        task: 'new-task',
        isDone: 0,
      };

      const result = await todoController.create(body);

      expect(result).toEqual(newTodoEntity);
      expect(todoService.create).toHaveBeenCalledWith(body);
      expect(todoService.create).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', async () => {
      const body: CreateTodoDto = {
        task: 'new-task',
        isDone: 0,
      };

      jest.spyOn(todoService, 'create').mockRejectedValueOnce(new Error());

      expect(todoController.create(body)).rejects.toThrowError();
    });
  });

  describe('show', () => {
    it('should get a todo item sucessfully', async () => {
      const result = await todoController.show('1');

      expect(result).toEqual(todoEntityList[0]);
      expect(todoService.findOneOrFail).toHaveBeenCalledWith('1');
      expect(todoService.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', () => {
      jest
        .spyOn(todoService, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());

      expect(todoController.show('1')).rejects.toThrowError();
    });
  });

  describe('update', () => {
    it('should update a todo item sucessfully', async () => {
      const body: UpdateTodoDto = {
        task: 'task-1',
        isDone: 1,
      };

      const result = await todoController.update('1', body);

      expect(result).toEqual(updateTodoEntity);
      expect(todoService.update).toHaveBeenCalledTimes(1);
      expect(todoService.update).toHaveBeenCalledWith('1', body);
    });

    it('should throw an exception', async () => {
      const body: UpdateTodoDto = {
        task: 'task-1',
        isDone: 1,
      };

      jest.spyOn(todoService, 'update').mockRejectedValueOnce(new Error());

      expect(todoController.update('1', body)).rejects.toThrowError();
    });
  });

  describe('destroy', () => {
    it('should remove a todo item sucessfully', async () => {
      const result = await todoController.destroy('1');

      expect(result).toBeUndefined();
    });

    it('should throw an exception', () => {
      jest.spyOn(todoService, 'deleteById').mockRejectedValueOnce(new Error());

      expect(todoController.destroy('1')).rejects.toThrowError();
    });
  });
});
