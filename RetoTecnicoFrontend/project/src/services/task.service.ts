import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilters, PagedResponse } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = 'http://localhost:8093/tasks';

  constructor(private http: HttpClient) {}

  // Obtener todas las tareas con paginación y filtros
  getAllTasks(filters?: TaskFilters): Observable<PagedResponse<Task>> {
    let params = new HttpParams();
    if (filters) {
      if (filters.state) params = params.set('state', filters.state);
      if (filters.title) params = params.set('title', filters.title);
      if (filters.dueDate) params = params.set('dueDate', filters.dueDate);
      if (filters.sort) params = params.set('sort', filters.sort);
      if (filters.page !== undefined) params = params.set('page', filters.page.toString());
      if (filters.size !== undefined) params = params.set('size', filters.size.toString());
      if (filters.direction) params = params.set('direction', filters.direction);
    }
    return this.http.get<PagedResponse<Task>>(this.baseUrl, { params });
  }

  // Obtener tarea por ID
  getTaskById(taskId: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${taskId}`);
  }

  // Obtener tareas del usuario autenticado con filtros
  getMyTasks(filters?: TaskFilters): Observable<Task[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.state) params = params.set('state', filters.state);
      if (filters.title) params = params.set('title', filters.title);
      if (filters.dueDate) params = params.set('dueDate', filters.dueDate);
      if (filters.sort) params = params.set('sort', filters.sort);
    }
    return this.http.get<Task[]>(`${this.baseUrl}/my-tasks`, { params });
  }

  // Crear nueva tarea
  createTask(request: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, request);
  }

  // Actualizar tarea completa
  updateTask(taskId: number, request: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${taskId}`, request);
  }

  // Eliminar tarea
  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${taskId}`);
  }

  // Marcar tarea como completada
  completeTask(taskId: number): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/${taskId}`, {});
  }
}