import {User} from "./user.model";

export interface Task {
  id: number;
  title: string;
  description: string;
  creationDate: string; // LocalDate from backend
  dueDate: string; // LocalDate from backend
  state: TaskState;
  user: User;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
}

export enum TaskState {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED'
}

export interface TaskFilters {
  state?: TaskState;
  title?: string;
  dueDate?: string;
  sort?: string;
  page?: number;
  size?: number;
  direction?: 'ASC' | 'DESC';
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}