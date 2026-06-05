import { createTodo } from '../src/lib/todo';

describe('Todo', () => {
  test('createTodo creates a todo with title', () => {
    const todo = createTodo('Test task');
    expect(todo.title).toBe('Test task');
  });

  test('createTodo generates unique id', () => {
    const todo1 = createTodo('Task 1');
    const todo2 = createTodo('Task 2');
    expect(todo1.id).not.toBe(todo2.id);
  });

  test('createTodo sets completed to false', () => {
    const todo = createTodo('Test task');
    expect(todo.completed).toBe(false);
  });

  test('createTodo sets createdAt to ISO string', () => {
    const todo = createTodo('Test task');
    expect(todo.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});