import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Todo, Priority, CreateTodoRequest, UpdateTodoRequest } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ editTodo() ? 'Edit Todo' : 'New Todo' }}</h2>
          <button class="close-btn" (click)="onClose()">&#10005;</button>
        </div>

        <form class="form" (ngSubmit)="submit()" #f="ngForm">
          <div class="field">
            <label>Title <span class="required">*</span></label>
            <input
              name="title"
              [(ngModel)]="title"
              required
              maxlength="255"
              placeholder="What needs to be done?"
              autofocus
            />
          </div>

          <div class="field">
            <label>Description</label>
            <textarea
              name="description"
              [(ngModel)]="description"
              rows="3"
              maxlength="2000"
              placeholder="Optional details..."
            ></textarea>
          </div>

          <div class="row-fields">
            <div class="field">
              <label>Priority</label>
              <select name="priority" [(ngModel)]="priority">
                @for (p of priorities; track p) {
                  <option [value]="p">{{ p }}</option>
                }
              </select>
            </div>

            <div class="field">
              <label>Due Date</label>
              <input type="date" name="dueDate" [(ngModel)]="dueDate" />
            </div>
          </div>

          <div class="field">
            <label>Tags <span class="hint">(comma-separated)</span></label>
            <input
              name="tags"
              [(ngModel)]="tagsInput"
              placeholder="e.g. work, urgent, personal"
            />
          </div>

          @if (error()) {
            <div class="form-error">{{ error() }}</div>
          }

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="onClose()">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="!title.trim()">
              {{ editTodo() ? 'Save Changes' : 'Add Todo' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrl: './todo-form.component.scss',
})
export class TodoFormComponent {
  editTodo = input<Todo | null>(null);
  closed = output<void>();

  private svc = inject(TodoService);

  priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  error = signal('');

  title = '';
  description = '';
  priority: Priority = 'MEDIUM';
  dueDate = '';
  tagsInput = '';

  ngOnInit() {
    const t = this.editTodo();
    if (t) {
      this.title = t.title;
      this.description = t.description ?? '';
      this.priority = t.priority;
      this.dueDate = t.dueDate ?? '';
      this.tagsInput = t.tags.join(', ');
    }
  }

  submit() {
    if (!this.title.trim()) { this.error.set('Title is required'); return; }
    const tags = this.tagsInput.split(',').map(s => s.trim()).filter(Boolean);
    const dueDate = this.dueDate || null;

    const existing = this.editTodo();
    if (existing) {
      const req: UpdateTodoRequest = { title: this.title.trim(), description: this.description || null, priority: this.priority, dueDate, tags };
      this.svc.update(existing.id, req);
    } else {
      const req: CreateTodoRequest = { title: this.title.trim(), description: this.description || undefined, priority: this.priority, dueDate, tags };
      this.svc.create(req);
    }
    this.closed.emit();
  }

  onClose() { this.closed.emit(); }
}
