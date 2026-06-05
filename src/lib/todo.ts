export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: string;
}

export function createTodo(title: string): Todo {
  return {
    id: generateId(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}