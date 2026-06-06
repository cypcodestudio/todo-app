import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-bar">
      <div class="stat-card">
        <span class="stat-value">{{ stats().total }}</span>
        <span class="stat-label">Total</span>
      </div>
      <div class="stat-card active">
        <span class="stat-value">{{ stats().active }}</span>
        <span class="stat-label">Active</span>
      </div>
      <div class="stat-card completed">
        <span class="stat-value">{{ stats().completed }}</span>
        <span class="stat-label">Done</span>
      </div>
      @if (stats().overdue > 0) {
        <div class="stat-card overdue">
          <span class="stat-value">{{ stats().overdue }}</span>
          <span class="stat-label">Overdue</span>
        </div>
      }
      @if (stats().active > 0) {
        <div class="progress-wrap">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="completionPct()"></div>
          </div>
          <span class="progress-label">{{ completionPct() }}% complete</span>
        </div>
      }
    </div>
  `,
  styleUrl: './todo-stats.component.scss',
})
export class TodoStatsComponent {
  private svc = inject(TodoService);
  stats = this.svc.stats;
  completionPct = () => {
    const s = this.stats();
    return s.total === 0 ? 0 : Math.round((s.completed / s.total) * 100);
  };
}
