import { loadTasks, saveTasks } from '../src/lib/storage';
import { Todo } from '../src/lib/todo';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

beforeEach(() => {
  mockLocalStorage.clear();
});

describe('Storage', () => {
  test('loadTasks returns empty array when no data', () => {
    const tasks = loadTasks();
    expect(tasks).toEqual([]);
  });

  test('loadTasks returns saved tasks', () => {
    const tasks: Todo[] = [
      { id: '1', title: 'Task 1', completed: false, createdAt: '2024-01-01T00:00:00.000Z' },
    ];
    saveTasks(tasks);
    
    const loaded = loadTasks();
    expect(loaded).toEqual(tasks);
  });

  test('saveTasks stores tasks in localStorage', () => {
    const tasks: Todo[] = [
      { id: '1', title: 'Task 1', completed: false, createdAt: '2024-01-01T00:00:00.000Z' },
    ];
    saveTasks(tasks);
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'nextjs-todo-tasks',
      JSON.stringify(tasks)
    );
  });
});