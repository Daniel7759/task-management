import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-task-test',
    imports: [CommonModule],
  template: `
    <div>
      <h2>Mis Tareas</h2>
      <ul *ngIf="tasks && tasks.length; else noTasks">
        <li *ngFor="let task of tasks">
          <strong>{{ task.title }}</strong> - {{ task.description }}<br>
          Fecha de vencimiento: {{ task.dueDate }}<br>
          Estado: {{ task.state }}
        </li>
      </ul>
      <ng-template #noTasks>
        <p>No hay tareas para mostrar.</p>
      </ng-template>
      <div *ngIf="error" style="color:red;">{{ error }}</div>
    </div>
  `
})
export class TaskTestComponent implements OnInit {
  tasks: Task[] = [];
  error: string | null = null;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.taskService.getMyTasks().subscribe({
      next: (tasks) => this.tasks = tasks,
      error: (err) => this.error = 'Error al cargar las tareas.'
    });
  }
}

