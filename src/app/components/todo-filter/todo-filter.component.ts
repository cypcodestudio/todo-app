import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { Priority, StatusFilter, SortBy } from '../../models/todo.model';

@Component({
  selector: 'app-todo-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-bar">
      <div class="search-wrap">
        <span class="search-icon">&#128269;</span>
        <input
          class="search-input"
          type="text"
          placeholder="Search todos..."
          [ngModel]="filter().search ?? ''"
          (ngModelChange)="onSearch($event)"
        />
      </div>

      <div class="filter-group">
        <button
          class="filter-btn"
          [class.active]="filter().status === s"
          *ngFor="let s of statusOptions"
          (click)="setStatus(s)"
        >{{ s }}</button>
      </div>

      <div class="filter-group">
        <select class="filter-select" [ngModel]="filter().priority ?? ''" (ngModelChange)="setPriority($event)">
          <option value="">All priorities</option>
          @for (p of priorities; track p) {
            <option [value]="p">{{ p }}</option>
          }
        </select>

        <select class="filter-select" [ngModel]="filter().tag ?? ''" (ngModelChange)="setTag($event)">
          <option value="">All tags</option>
          @for (t of allTags(); track t) {
            <option [value]="t">{{ t }}</option>
          }
        </select>

        <select class="filter-select" [ngModel]="filter().sortBy" (ngModelChange)="setSortBy($event)">
          <option value="createdAt">Newest first</option>
          <option value="dueDate">Due date</option>
          <option value="priority">Priority</option>
          <option value="title">Title A–Z</option>
        </select>

        <button class="icon-btn" (click)="toggleDir()" [title]="filter().sortDir === 'asc' ? 'Ascending' : 'Descending'">
          {{ filter().sortDir === 'asc' ? '↑' : '↓' }}
        </button>
      </div>
    </div>
  `,
  styleUrl: './todo-filter.component.scss',
})
export class TodoFilterComponent {
  private svc = inject(TodoService);
  filter = this.svc.filter;
  allTags = this.svc.allTags;

  statusOptions: StatusFilter[] = ['all', 'active', 'completed'];
  priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  onSearch(val: string) {
    this.filter.update(f => ({ ...f, search: val || undefined, page: 0 }));
  }

  setStatus(s: StatusFilter) {
    this.filter.update(f => ({ ...f, status: s, page: 0 }));
  }

  setPriority(p: string) {
    this.filter.update(f => ({ ...f, priority: (p as Priority) || undefined, page: 0 }));
  }

  setTag(t: string) {
    this.filter.update(f => ({ ...f, tag: t || undefined, page: 0 }));
  }

  setSortBy(s: SortBy) {
    this.filter.update(f => ({ ...f, sortBy: s, page: 0 }));
  }

  toggleDir() {
    this.filter.update(f => ({ ...f, sortDir: f.sortDir === 'asc' ? 'desc' : 'asc' }));
  }
}
