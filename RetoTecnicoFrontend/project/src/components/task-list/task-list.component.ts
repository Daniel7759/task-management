import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task, TaskState, TaskFilters, PagedResponse } from '../../models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TaskFormComponent],
  template: `
    <div class="card">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Mis Tareas</h2>
        <button
          (click)="openTaskForm()"
          class="btn-primary"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nueva Tarea
        </button>
      </div>

      <!-- Filters -->
      <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select formControlName="state" class="input-field">
            <option value="">Todos</option>
            <option value="PENDING">Pendientes</option>
            <option value="COMPLETED">Completadas</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            type="text"
            formControlName="title"
            placeholder="Buscar por título..."
            class="input-field"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
          <select formControlName="sort" class="input-field">
            <option value="creationDate">Fecha de creación</option>
            <option value="dueDate">Fecha de vencimiento</option>
            <option value="title">Título</option>
          </select>
        </div>

        <div class="flex items-end">
          <button
            type="button"
            (click)="clearFilters()"
            class="btn-secondary w-full"
          >
            Limpiar Filtros
          </button>
        </div>
      </form>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span class="ml-2 text-gray-600">Cargando tareas...</span>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && tasks.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No hay tareas</h3>
        <p class="text-gray-500 mb-4">Crea tu primera tarea para comenzar</p>
        <button (click)="openTaskForm()" class="btn-primary">
          Crear Tarea
        </button>
      </div>

      <!-- Task List -->
      <div *ngIf="!isLoading && tasks.length > 0" class="space-y-4">
        <div
          *ngFor="let task of tasks; trackBy: trackByTaskId"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 animate-fade-in"
          [class.border-l-4]="true"
          [class.border-l-success-500]="task.state === 'COMPLETED'"
          [class.border-l-warning-500]="task.state === 'PENDING' && !isOverdue(task)"
          [class.border-l-error-500]="task.state === 'PENDING' && isOverdue(task)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <h3 class="text-lg font-semibold text-gray-900 mr-3" 
                    [class.line-through]="task.state === 'COMPLETED'"
                    [class.text-gray-500]="task.state === 'COMPLETED'">
                  {{ task.title }}
                </h3>
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  [class.bg-success-100]="task.state === 'COMPLETED'"
                  [class.text-success-700]="task.state === 'COMPLETED'"
                  [class.bg-warning-100]="task.state === 'PENDING' && !isOverdue(task)"
                  [class.text-warning-700]="task.state === 'PENDING' && !isOverdue(task)"
                  [class.bg-error-100]="task.state === 'PENDING' && isOverdue(task)"
                  [class.text-error-700]="task.state === 'PENDING' && isOverdue(task)"
                >
                  {{ getTaskStateLabel(task) }}
                </span>
              </div>
              
              <p class="text-gray-600 mb-3" 
                 [class.text-gray-400]="task.state === 'COMPLETED'">
                {{ task.description }}
              </p>
              
              <div class="flex items-center text-sm text-gray-500 space-x-4">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Vence: {{ formatDate(task.dueDate) }}
                </span>
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Creada: {{ formatDate(task.creationDate) }}
                </span>
              </div>
            </div>

            <div class="flex items-center space-x-2 ml-4">
              <button
                *ngIf="task.state === 'PENDING'"
                (click)="completeTask(task.id)"
                class="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors duration-200"
                title="Marcar como completada"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>

              <button
                (click)="editTask(task)"
                class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                title="Editar tarea"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>

              <button
                (click)="confirmDeleteTask(task)"
                class="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors duration-200"
                title="Eliminar tarea"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div *ngIf="pagedResponse && pagedResponse.totalPages > 1" class="flex items-center justify-between pt-6">
          <div class="text-sm text-gray-700">
            Mostrando {{ (pagedResponse.number * pagedResponse.size) + 1 }} a 
            {{ Math.min((pagedResponse.number + 1) * pagedResponse.size, pagedResponse.totalElements) }} 
            de {{ pagedResponse.totalElements }} tareas
          </div>
          
          <div class="flex space-x-2">
            <button
              (click)="previousPage()"
              [disabled]="pagedResponse.first"
              class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              (click)="nextPage()"
              [disabled]="pagedResponse.last"
              class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Form Modal -->
    <app-task-form
      *ngIf="showTaskForm"
      [task]="selectedTask"
      (save)="onTaskSaved($event)"
      (cancel)="closeTaskForm()"
    ></app-task-form>

    <!-- Delete Confirmation Modal -->
    <div *ngIf="taskToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md mx-4 animate-bounce-in">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmar Eliminación</h3>
        <p class="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar la tarea "{{ taskToDelete.title }}"? 
          Esta acción no se puede deshacer.
        </p>
        <div class="flex justify-end space-x-3">
          <button (click)="cancelDelete()" class="btn-secondary">
            Cancelar
          </button>
          <button (click)="deleteTask()" class="btn-danger">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  `
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  pagedResponse?: PagedResponse<Task>;
  isLoading = false;
  showTaskForm = false;
  selectedTask?: Task;
  taskToDelete?: Task;
  
  filterForm: FormGroup;
  currentFilters: TaskFilters = { page: 0, size: 10 };

  constructor(
    private taskService: TaskService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      state: [''],
      title: [''],
      sort: ['creationDate']
    });

    // Subscribe to form changes
    this.filterForm.valueChanges.subscribe(values => {
      this.currentFilters = {
        ...this.currentFilters,
        state: values.state || undefined,
        title: values.title || undefined,
        sort: values.sort,
        page: 0 // Reset to first page when filters change
      };
      this.loadTasks();
    });
  }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading = true;
    // Limpiar filtros vacíos para no enviar parámetros innecesarios
    const filters: any = {};
    if (this.currentFilters.state) filters.state = this.currentFilters.state;
    if (this.currentFilters.title) filters.title = this.currentFilters.title;
    // Solo enviar sort si es 'title' o 'dueDate'
    if (this.currentFilters.sort === 'title' || this.currentFilters.sort === 'dueDate') {
      filters.sort = this.currentFilters.sort;
    }
    if (this.currentFilters.dueDate) filters.dueDate = this.currentFilters.dueDate;
    this.taskService.getMyTasks(filters).subscribe({
      next: (response) => {
        this.tasks = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      }
    });
  }

  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }

  openTaskForm(task?: Task) {
    this.selectedTask = task;
    this.showTaskForm = true;
  }

  closeTaskForm() {
    this.showTaskForm = false;
    this.selectedTask = undefined;
  }

  onTaskSaved(task: Task) {
    this.closeTaskForm();
    this.loadTasks();
  }

  editTask(task: Task) {
    this.openTaskForm(task);
  }

  completeTask(taskId: number) {
    this.taskService.completeTask(taskId).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error completing task:', error);
      }
    });
  }

  confirmDeleteTask(task: Task) {
    this.taskToDelete = task;
  }

  deleteTask() {
    if (this.taskToDelete) {
      this.taskService.deleteTask(this.taskToDelete.id).subscribe({
        next: () => {
          this.loadTasks();
          this.cancelDelete();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  cancelDelete() {
    this.taskToDelete = undefined;
  }

  clearFilters() {
    this.filterForm.reset({ sort: 'creationDate' });
  }

  previousPage() {
    if (this.pagedResponse && !this.pagedResponse.first) {
      this.currentFilters.page = this.pagedResponse.number - 1;
      this.loadTasks();
    }
  }

  nextPage() {
    if (this.pagedResponse && !this.pagedResponse.last) {
      this.currentFilters.page = this.pagedResponse.number + 1;
      this.loadTasks();
    }
  }

  isOverdue(task: Task): boolean {
    if (task.state === TaskState.COMPLETED) return false;
    return new Date(task.dueDate) < new Date();
  }

  getTaskStateLabel(task: Task): string {
    if (task.state === TaskState.COMPLETED) return 'Completada';
    if (this.isOverdue(task)) return 'Vencida';
    return 'Pendiente';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  protected readonly Math = Math;
}