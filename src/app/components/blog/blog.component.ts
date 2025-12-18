import { BehaviorSubject, finalize, switchMap } from 'rxjs';
import {
  Component,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { BlogService } from '../../service/blog.service';
import { ReactionService } from '../../service/reaction.service';
import { CategoryStore } from '../../stores/category.store';

import { IBlog, ReactionType } from '../../models/blog.model';
import { paginatedResult } from '../../models/paginatedResult.model';
import { LoadState, loadState } from '../../shared/state/load-state';
import { PaginationComponent } from '../../shared/component/pagination/pagination.component';
import { ReactionComponent } from '../../shared/component/reaction/reaction.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, PaginationComponent, ReactionComponent],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent {

  private blogService = inject(BlogService);
  private reactService = inject(ReactionService);
  store = inject(CategoryStore);

  ReactionType = ReactionType;

  /* -------------------- MAIN STATE -------------------- */

  blogState = signal<LoadState<paginatedResult<IBlog>>>({
    status: 'loading'
  });

  pageNumber = signal(1);

  totalPages = computed(() => {
    const s = this.blogState();
    return s.status === 'success' ? s.data.totalPages : 0;
  });

  // 🚨 lock server sync during optimistic reaction
  private reacting = signal(false);
  private hasInitialLoad = signal(false);

  /* -------------------- SERVER RESPONSE -------------------- */
  pageSize = signal(6);

  private page$ = new BehaviorSubject({
    page: this.pageNumber(),
    size: this.pageSize()
  });

  loadPage(page: number) {
    if (page === this.pageNumber()) return;

    this.pageNumber.set(page);

    this.page$.next({
      page,
      size: this.pageSize()
    });
  }

  blogResponse = toSignal(
    loadState(
      this.page$.pipe(
        switchMap(({ page, size }) =>
          this.blogService.GetAll(page, size)
        )
      )
    ),
    { initialValue: { status: 'loading' } as LoadState<paginatedResult<IBlog>> }
  );

  /* -------------------- SAFE SERVER SYNC -------------------- */

  syncFromServer = effect(() => {
    const res = this.blogResponse();

    if (!res) return;

    if (res.status === 'loading') {
      if (!this.hasInitialLoad()) {
        this.blogState.set({ status: 'loading' });
      }
      return;
    }

    if (res.status === 'error') {
      this.blogState.set(res);
      return;
    }

    if (res.status === 'success') {
      // ⛔ DO NOT overwrite optimistic reactions
      if (this.reacting()) return;

      this.blogState.set(res);
      this.hasInitialLoad.set(true);
    }
  }, { allowSignalWrites: true });

  /* -------------------- DERIVED SIGNALS -------------------- */

  blogs = computed(() => {
   
    const s = this.blogState();
    return s.status === 'success' ? s.data.items : [];

  });

  /* -------------------- OPTIMISTIC REACTION -------------------- */

  reactOptimistic(blogId: number, reaction: ReactionType)
  {

    const state = this.blogState();
    if (state.status !== 'success') return;

    const target = state.data.items.find(b => b.id === blogId);
    if (!target) return;

    const prevReaction = target.userReaction;
    const prevLike = target.likeCounts;
    const prevDislike = target.dislikeCounts;

    const newReaction =
      prevReaction === reaction ? ReactionType.Null : reaction;

    let like = prevLike;
    let dislike = prevDislike;

    if (prevReaction === ReactionType.Liked) like--;
    if (prevReaction === ReactionType.Disliked) dislike--;

    if (newReaction === ReactionType.Liked) like++;
    if (newReaction === ReactionType.Disliked) dislike++;

    // ✅ OPTIMISTIC UPDATE (single source)
    this.blogState.update(s => {
      if (s.status !== 'success') return s;

      return {
        ...s,
        data: {
          ...s.data,
          items: s.data.items.map(b =>
            b.id === blogId
              ? {
                  ...b,
                  userReaction: newReaction,
                  likeCounts: like,
                  dislikeCounts: dislike
                }
              : b
          )
        }
      };
    });

    // ✅ SERVER CONFIRMATION
    this.reactService.react(blogId, newReaction).subscribe({
      next: (res: any) => {
        this.blogState.update(s => {
          if (s.status !== 'success') return s;

          return {
            ...s,
            data: {
              ...s.data,
              items: s.data.items.map(b =>
                b.id === blogId
                  ? {
                      ...b,
                      likeCounts: res.data.like,
                      dislikeCounts: res.data.dislike,
                      userReaction: res.data.userReaction
                    }
                  : b
              )
            }
          };
        });
      },
      error: () => {
        // rollback
        this.blogState.update(s => {
          if (s.status !== 'success') return s;

          return {
            ...s,
            data: {
              ...s.data,
              items: s.data.items.map(b =>
                b.id === blogId
                  ? {
                      ...b,
                      userReaction: prevReaction,
                      likeCounts: prevLike,
                      dislikeCounts: prevDislike
                    }
                  : b
              )
            }
          };
        });
      }
    });
  }

  like(id: number) {
    console.log('LIKE CLICKED', id);
    this.reactOptimistic(id, ReactionType.Liked);
    console.log("crrent blogs: ",this.blogs());
    console.log("blogs final state: ", this.blogState())
  }

  dislike(id: number) {
    console.log('DISLIKE CLICKED', id);
    console.log("crrent blogs: ",this.blogs());
    this.reactOptimistic(id, ReactionType.Disliked);
  }

}
