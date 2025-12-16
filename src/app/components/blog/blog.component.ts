import { BehaviorSubject, filter, switchMap } from 'rxjs';
import { Component, computed, inject, Signal, signal } from '@angular/core';
import { BlogService } from '../../service/blog.service';
import { CategoryStore } from '../../stores/category.store';
import { IBlog } from '../../models/blog.model';
import { map, single } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Action } from 'rxjs/internal/scheduler/Action';
import { LoadState, loadState } from '../../shared/state/load-state';
import { paginatedResult } from '../../models/paginatedResult.model';

@Component({
  selector: 'app-blog',
  imports: [DatePipe, CommonModule, RouterLink, CommonModule],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent {

  private blogService = inject(BlogService);
  store = inject(CategoryStore);

  // keep signals for UI
  pageNumber = signal(1);
  pageSize = signal(6);

  // BehaviorSubject that drives requests; small shape to include page & size
  private page$ = new BehaviorSubject<{ page: number; size: number }>({
    page: this.pageNumber(),
    size: this.pageSize()
  });

  // Build a reactive observable that switches to the new GetAll() on page$ changes.
  // loadState wraps loading/error/success and we pass that whole stream to toSignal
  blogResponse = toSignal<LoadState<paginatedResult<IBlog>>>(
    loadState(
      this.page$.pipe(
        // whenever page$ emits, call GetAll with current values
        switchMap(({ page, size }) => this.blogService.GetAll(page, size))
      ),
      2000
    ),
    { initialValue: { status: 'loading' } as any }
  );

  // derived signals
  blogs = computed(() => {
    const s = this.blogResponse();
    return s?.status === 'success' && Array.isArray(s.data.items) ? s.data.items : [];
  });

  totalCount = computed(() => {
    const s = this.blogResponse();
    return s?.status === 'success' && typeof s.data.totalCount === 'number' ? s.data.totalCount : 0;
  });

  totalPages = computed(() => {
    const s = this.blogResponse();
    return s?.status === 'success' && typeof s.data.totalPages === 'number' ? s.data.totalPages : 0;
  });

  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // paginationWindow (same as before)
  paginationWindow = computed(() => {
    const all = this.pages();
    const current = this.pageNumber();
    const total = all.length;
    if (total <= 7) return all;
    const windowSize = 5;
    let start = Math.max(1, current - Math.floor(windowSize / 2));
    let end = start + windowSize - 1;
    if (end > total) {
      end = total;
      start = Math.max(1, end - windowSize + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  // --- Pagination handlers now update both the signal and page$ subject ---
  loadPage(page: number) {
    if (page === this.pageNumber()) return;
    this.pageNumber.set(page);
    // push new page into page$ so the observable chain re-runs GetAll(...)
    this.page$.next({ page, size: this.pageSize() });
  }

  next() {
    if (this.pageNumber() < this.totalPages()) {
      const nextPage = this.pageNumber() + 1;
      this.pageNumber.set(nextPage);
      this.page$.next({ page: nextPage, size: this.pageSize() });
    }
  }

  prev() {
    if (this.pageNumber() > 1) {
      const prevPage = this.pageNumber() - 1;
      this.pageNumber.set(prevPage);
      this.page$.next({ page: prevPage, size: this.pageSize() });
    }
  }

  // trackBy helpers
  trackByBlog(_: number, b: IBlog) {
    return b?.id;
  }
  trackByNumber(_: number, v: number) {
    return v;
  }

} 
