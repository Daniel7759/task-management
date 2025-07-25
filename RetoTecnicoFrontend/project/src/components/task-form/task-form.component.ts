import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-in">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-gray-900">
              {{ isEditMode ? 'Editar Tarea' : 'Nueva Tarea' }}
            </h2>
            <button
              (click)="onCancel()"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                id="title"
                type="text"
                formControlName="title"
                class="input-field"
                placeholder="Ingresa el título de la tarea"
                [class.border-error-500]="taskForm.get('title')?.invalid && taskForm.get('title')?.touched"
              />
              <div *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched" class="mt-1">
                <p *ngIf="taskForm.get('title')?.errors?.['required']" class="text-sm text-error-600">
                  El título es requerido
                </p>
                <p *ngIf="taskForm.get('title')?.errors?.['maxlength']" class="text-sm text-error-600">
                  El título no puede tener más de 100 caracteres
                </p>
              </div>
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                id="description"
                formControlName="description"
                rows="4"
                class="input-field resize-none"
                placeholder="Describe la tarea en detalle"
                [class.border-error-500]="taskForm.get('description')?.invalid && taskForm.get('description')?.touched"
              ></textarea>
              <div *ngIf="taskForm.get('description')?.invalid && taskForm.get('description')?.touched" class="mt-1">
                <p *ngIf="taskForm.get('description')?.errors?.['required']" class="text-sm text-error-600">
                  La descripción es requerida
                </p>
                <p *ngIf="taskForm.get('description')?.errors?.['maxlength']" class="text-sm text-error-600">
                  La descripción no puede tener más de 500 caracteres
                </p>
              </div>
            </div>

            <div>
              <label for="dueDate" class="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Vencimiento *
              </label>
              <input
                id="dueDate"
                type="date"
                formControlName="dueDate"
                class="input-field"
                [min]="minDate"
                [class.border-error-500]="taskForm.get('dueDate')?.invalid && taskForm.get('dueDate')?.touched"
              />
              <div *ngIf="taskForm.get('dueDate')?.invalid && taskForm.get('dueDate')?.touched" class="mt-1">
                <p *ngIf="taskForm.get('dueDate')?.errors?.['required']" class="text-sm text-error-600">
                  La fecha de vencimiento es requerida
                </p>
                <p *ngIf="taskForm.get('dueDate')?.errors?.['futureDate']" class="text-sm text-error-600">
                  La fecha de vencimiento debe ser futura
                </p>
              </div>
            </div>

            <div *ngIf="errorMessage" class="p-3 bg-error-50 border border-error-200 rounded-lg">
              <p class="text-sm text-error-600">{{ errorMessage }}</p>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                (click)="onCancel()"
                class="btn-secondary"
                [disabled]="isLoading"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn-primary"
                [disabled]="taskForm.invalid || isLoading"
              >
                <span *ngIf="isLoading" class="inline-flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
                <span *ngIf="!isLoading">
                  {{ isEditMode ? 'Actualizar' : 'Crear' }} Tarea
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class TaskFormComponent implements OnInit {
  @Input() task?: Task;
  @Output() save = new EventEmitter<Task>();
  @Output() cancel = new EventEmitter<void>();

  taskForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  isEditMode = false;
  minDate = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService
  ) {
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow.toISOString().split('T')[0];

    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      dueDate: ['', [Validators.required, this.futureDateValidator]]
    });
  }

  ngOnInit() {
    this.isEditMode = !!this.task;
    
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        dueDate: this.task.dueDate
      });
    }
  }

  futureDateValidator(control: any) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate <= today ? { futureDate: true } : null;
  }

  onSubmit() {
    if (this.taskForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.taskForm.value;

      if (this.isEditMode && this.task) {
        const updateRequest: UpdateTaskRequest = {
          title: formValue.title,
          description: formValue.description,
          dueDate: formValue.dueDate
        };

        this.taskService.updateTask(this.task.id, updateRequest).subscribe({
          next: (updatedTask) => {
            this.isLoading = false;
            this.save.emit(updatedTask);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Error al actualizar la tarea. Por favor, inténtalo de nuevo.';
            console.error('Error updating task:', error);
          }
        });
      } else {
        const createRequest: CreateTaskRequest = {
          title: formValue.title,
          description: formValue.description,
          dueDate: formValue.dueDate
        };

        this.taskService.createTask(createRequest).subscribe({
          next: (newTask) => {
            this.isLoading = false;
            this.save.emit(newTask);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Error al crear la tarea. Por favor, inténtalo de nuevo.';
            console.error('Error creating task:', error);
          }
        });
      }
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}