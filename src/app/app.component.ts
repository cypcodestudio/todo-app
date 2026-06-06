import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoStatsComponent } from './components/todo-stats/todo-stats.component';
import { TodoFilterComponent } from './components/todo-filter/todo-filter.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { TodoFormComponent } from './components/todo-form/todo-form.component';
import { TodoService } from './services/todo.service';
import { Todo } from './models/todo.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TodoStatsComponent, TodoFilterComponent, TodoListComponent, TodoFormComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private svc = inject(TodoService);

  loading = this.svc.loading;
  error   = this.svc.error;

  showForm    = signal(false);
  editingTodo = signal<Todo | null>(null);

  openCreate() { this.editingTodo.set(null); this.showForm.set(true); }
  openEdit(todo: Todo) { this.editingTodo.set(todo); this.showForm.set(true); }
  closeForm()  { this.showForm.set(false); this.editingTodo.set(null); }
  dismissError() { this.svc.error.set(null); }
}
