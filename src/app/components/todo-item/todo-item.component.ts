import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="todo-item" [class.completed]="todo().completed" [class.overdue]="isOverdue()">
      <button class="check-btn" (click)="toggleComplete()" [attr.aria-label]="todo().completed ? 'Reopen' : 'Complete'">
        <span class="checkmark" [class.checked]="todo().completed">&#10003;</span>
      </button>

      <div class="todo-body" (click)="editRequest.emit(todo())">
        <div class="todo-top">
          <span class="todo-title">{{ todo().title }}</span>
          <span class="priority-badge priority-{{ todo().priority.toLowerCase() }}">{{ todo().priority }}</span>
        </div>

        @if (todo().description) {
          <p class="todo-desc">{{ todo().description }}</p>
        }

        <div class="todo-meta">
          @if (todo().dueDate) {
            <span class="meta-item" [class.overdue-text]="isOverdue()">
              &#128197; {{ todo().dueDate | date:'mediumDate' }}
              @if (isOverdue()) { <span class="overdue-badge">overdue</span> }
            </span>
          }
          @for (tag of todo().tags; track tag) {
            <span class="tag">{{ tag }}</span>
          }
          @if (todo().completedAt) {
            <span class="meta-item muted">&#10003; {{ todo().completedAt | date:'shortDate' }}</span>
          }
        </div>
      </div>

      <div class="todo-actions">
        <button class="action-btn edit" (click)="editRequest.emit(todo())" title="Edit">&#9998;</button>
        <button class="action-btn delete" (click)="confirmDelete()" title="Delete">&#128465;</button>
      </div>
    </div>
  `,
  styleUrl: './todo-item.component.scss',
})
export class TodoItemComponent {
  todo = input.required<Todo>();
  editRequest = output<Todo>();

  private svc = inject(TodoService);

  isOverdue() {
    const t = this.todo();
    if (!t.dueDate || t.completed) return false;
    return t.dueDate < new Date().toISOString().split('T')[0];
  }

  toggleComplete() {
    const t = this.todo();
    t.completed ? this.svc.reopen(t.id) : this.svc.complete(t.id);
  }

  confirmDelete() {
    if (confirm(`Delete "${this.todo().title}"?`)) this.svc.delete(this.todo().id);
  }
}
