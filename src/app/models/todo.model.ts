export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type StatusFilter = 'all' | 'active' | 'completed';
export type SortBy = 'createdAt' | 'dueDate' | 'priority' | 'title';
export type SortDir = 'asc' | 'desc';

export interface Todo {
  id: number;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: Priority;
  dueDate?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface TodoPage {
  content: Todo[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface TodoStats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  byPriority: Record<Priority, number>;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
  tags?: string[];
}

export interface UpdateTodoRequest {
  title: string;
  description?: string | null;
  priority: Priority;
  dueDate?: string | null;
  tags?: string[];
}

export interface TodoFilter {
  status: StatusFilter;
  priority?: Priority;
  tag?: string;
  search?: string;
  sortBy: SortBy;
  sortDir: SortDir;
  page: number;
  size: number;
}
