import { Injectable, inject, signal, Signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, tap, Subject, merge } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Todo,
  TodoPage,
  TodoStats,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoFilter,
  Priority,
} from '../models/todo.model';

const BASE = `${environment.apiUrl}/todos`;
const TAGS = `${environment.apiUrl}/tags`;

@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient);

  readonly filter = signal<TodoFilter>({
    status: 'all',
    sortBy: 'createdAt',
    sortDir: 'desc',
    page: 0,
    size: 20,
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** Emitting to this subject forces a refresh of the current page + stats */
  private readonly refresh$ = new Subject<void>();

  private readonly filter$ = toObservable(this.filter);

  readonly page = toSignal(
    merge(this.filter$, this.refresh$).pipe(
      switchMap(() => {
        this.loading.set(true);
        this.error.set(null);
        return this.http.get<TodoPage>(BASE, { params: this._params() }).pipe(
          tap({ error: (e: Error) => this.error.set(e.message) }),
        );
      }),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: { content: [], totalElements: 0, totalPages: 1, page: 0, size: 20, first: true, last: true } as TodoPage },
  ) as Signal<TodoPage>;

  readonly stats = toSignal(
    merge(this.filter$, this.refresh$).pipe(
      switchMap(() => this.http.get<TodoStats>(`${BASE}/stats`)),
    ),
    { initialValue: { total: 0, completed: 0, active: 0, overdue: 0, byPriority: {} as Record<Priority, number> } as TodoStats },
  ) as Signal<TodoStats>;

  readonly allTags = toSignal(
    this.refresh$.pipe(
      switchMap(() => this.http.get<string[]>(TAGS)),
    ),
    { initialValue: [] as string[] },
  ) as Signal<string[]>;

  create(req: CreateTodoRequest): void {
    this.http.post<Todo>(BASE, req).subscribe({ next: () => this.refresh$.next(), error: e => this.error.set(e.message) });
  }

  update(id: number, req: UpdateTodoRequest): void {
    this.http.put<Todo>(`${BASE}/${id}`, req).subscribe({ next: () => this.refresh$.next(), error: e => this.error.set(e.message) });
  }

  complete(id: number): void {
    this.http.patch<Todo>(`${BASE}/${id}/complete`, {}).subscribe({ next: () => this.refresh$.next(), error: e => this.error.set(e.message) });
  }

  reopen(id: number): void {
    this.http.patch<Todo>(`${BASE}/${id}/reopen`, {}).subscribe({ next: () => this.refresh$.next(), error: e => this.error.set(e.message) });
  }

  delete(id: number): void {
    this.http.delete(`${BASE}/${id}`).subscribe({ next: () => this.refresh$.next(), error: e => this.error.set(e.message) });
  }

  bulkDelete(ids: number[]): void {
    this.http.post(`${BASE}/bulk-delete`, { ids }).subscribe({ next: () => this.refresh$.next(), error: e => this.error.set(e.message) });
  }

  private _params(): HttpParams {
    const f = this.filter();
    let p = new HttpParams()
      .set('status',  f.status)
      .set('sortBy',  f.sortBy)
      .set('sortDir', f.sortDir)
      .set('page',    f.page)
      .set('size',    f.size);
    if (f.priority) p = p.set('priority', f.priority);
    if (f.tag)      p = p.set('tag', f.tag);
    if (f.search)   p = p.set('search', f.search);
    return p;
  }
}
