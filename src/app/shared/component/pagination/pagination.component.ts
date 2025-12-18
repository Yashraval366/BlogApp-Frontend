import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IBlog } from '../../../models/blog.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {

  @Input({ required: true }) page!: number;
  @Input({ required: true }) totalPages!: number;

  @Output() pageChange = new EventEmitter<number>();

  pages = computed(() =>
    Array.from({ length: this.totalPages }, (_, i) => i + 1)
  );

  paginationWindow = computed(() => {
    const total = this.pages().length;
    const current = this.page;
    if (total <= 7) return this.pages();

    const windowSize = 5;
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  
  goTo(page: number) {
    if (page !== this.page) {
      this.pageChange.emit(page);
    }
  }

  next() {
    if (this.page < this.totalPages) {
      this.pageChange.emit(this.page + 1);
    }
  }

  prev() {
    if (this.page > 1) {
      this.pageChange.emit(this.page - 1);
    }
  }

}
