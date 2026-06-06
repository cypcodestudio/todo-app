import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../services/todo.service';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoItemComponent],
  template: `
    @if (page().content.length === 0) {
      <div class="empty-state">
        <div class="empty-icon">&#9989;</div>
        <h3>No todos found</h3>
        <p>Try adjusting your filters or create a new todo.</p>
      </div>
    } @else {
      <div class="list-header">
        <label class="select-all">
          <input
            type="checkbox"
            [indeterminate]="someSelected()"
            [checked]="allSelected()"
            (change)="toggleSelectAll($event)"
          />
          <span class="select-label">{{ selected().size > 0 ? selected().size + ' selected' : '' }}</span>
        </label>

        @if (selected().size > 0) {
          <button class="bulk-delete-btn" (click)="bulkDelete()">
            &#128465; Delete {{ selected().size }}
          </button>
        }

        <span class="count-label">{{ page().totalElements }} todo{{ page().totalElements !== 1 ? 's' : '' }}</span>
      </div>

      <div class="todo-list">
        @for (todo of page().content; track todo.id) {
          <div class="list-row" [class.row-selected]="selected().has(todo.id)">
            <input
              class="row-check"
              type="checkbox"
              [checked]="selected().has(todo.id)"
              (change)="toggleSelect(todo.id)"
            />
            <app-todo-item
              [todo]="todo"
              (editRequest)="editRequest.emit($event)"
              style="flex:1;min-width:0"
            />
          </div>
        }
      </div>

      @if (page().totalPages > 1) {
        <div class="pagination">
          <button class="page-btn" [disabled]="page().first" (click)="prevPage()">&#8592; Prev</button>
          <span class="page-info">Page {{ page().page + 1 }} of {{ page().totalPages }}</span>
          <button class="page-btn" [disabled]="page().last" (click)="nextPage()">Next &#8594;</button>
        </div>
      }
    }
  `,
  styleUrl: './todo-list.component.scss',
})
export class TodoListComponent {
  private svc = inject(TodoService);
  page = this.svc.page;
  filter = this.svc.filter;
  editRequest = output<Todo>();

  selected = signal(new Set<number>());

  allSelected() {
    const ids = this.page().content.map(t => t.id);
    return ids.length > 0 && ids.every(id => this.selected().has(id));
  }

  someSelected() {
    const ids = this.page().content.map(t => t.id);
    const sel = this.selected();
    return ids.some(id => sel.has(id)) && !ids.every(id => sel.has(id));
  }

  toggleSelectAll(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    const ids = this.page().content.map(t => t.id);
    this.selected.update(s => {
      const next = new Set(s);
      checked ? ids.forEach(id => next.add(id)) : ids.forEach(id => next.delete(id));
      return next;
    });
  }

  toggleSelect(id: number) {
    this.selected.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  bulkDelete() {
    const ids = Array.from(this.selected());
    if (confirm(`Delete ${ids.length} todos?`)) {
      this.svc.bulkDelete(ids);
      this.selected.set(new Set());
    }
  }

  prevPage() { this.filter.update(f => ({ ...f, page: f.page - 1 })); }
  nextPage() { this.filter.update(f => ({ ...f, page: f.page + 1 })); }
}
