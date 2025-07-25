import {Task} from "./task.model";

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  tasks?: Task[];
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  email?: string;
}