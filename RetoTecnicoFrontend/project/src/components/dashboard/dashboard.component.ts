import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task, TaskState } from '../../models/task.model';
import { TaskListComponent } from '../task-list/task-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TaskListComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h1 class="text-xl font-bold text-gray-900">TaskFlow</h1>
            </div>

            <div class="flex items-center space-x-4">
              <div class="text-sm text-gray-600">
                Bienvenido, <span class="font-medium">{{ currentUser?.username }}</span>
              </div>
              <button
                (click)="logout()"
                class="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors duration-200"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-primary-100 mr-4">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
                <p class="text-sm text-gray-600">Total de Tareas</p>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-warning-100 mr-4">
                <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
                <p class="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-success-100 mr-4">
                <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900">{{ stats.completed }}</p>
                <p class="text-sm text-gray-600">Completadas</p>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-error-100 mr-4">
                <svg class="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L5.18 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900">{{ stats.overdue }}</p>
                <p class="text-sm text-gray-600">Vencidas</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Task List -->
        <app-task-list></app-task-list>
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentUser = this.authService.getCurrentUser();
  stats = {
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0
  };

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.taskService.getMyTasks({ size: 1000 }).subscribe(response => {
      const tasks: Task[] = response;
      this.stats.total = tasks.length;
      this.stats.pending = tasks.filter((task: Task) => task.state === TaskState.PENDING).length;
      this.stats.completed = tasks.filter((task: Task) => task.state === TaskState.COMPLETED).length;

      // Calcular tareas vencidas
      const today = new Date();
      this.stats.overdue = tasks.filter((task: Task) =>
        task.state === TaskState.PENDING && new Date(task.dueDate) < today
      ).length;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}