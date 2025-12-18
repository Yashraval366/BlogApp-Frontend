import { loadState, LoadState } from './../../../shared/state/load-state';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '../../../service/blog.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, map, of, switchMap, tap } from 'rxjs';
import { IBlog, ReactionType } from '../../../models/blog.model';
import { FormsModule, ɵInternalFormsSharedModule } from "@angular/forms";
import { PaginationComponent } from '../../../shared/component/pagination/pagination.component';
import { ReactionComponent } from '../../../shared/component/reaction/reaction.component';
import { paginatedResult } from '../../../models/paginatedResult.model';
import { ReactionService } from '../../../service/reaction.service';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-my-blogs',
  imports: [DatePipe, CommonModule, FormsModule, PaginationComponent, ReactionComponent],
  templateUrl: './my-blogs.component.html',
  styleUrls: ['./my-blogs.component.css']
})
export class MyBlogsComponent {

  private blogService = inject(BlogService)
  private route = inject(ActivatedRoute);
  private reactService = inject(ReactionService)

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

  private auth = inject(AuthService);

  userId = computed(() => this.auth.getUserId());

  blogResponse = toSignal(
    loadState(
      this.page$.pipe(
        switchMap(({ page, size }) =>
          this.blogService.GetUserBlogs(this.userId()!, page, size).pipe(
            tap(res => console.log(res))
          )
        )
      )
    ),
    { initialValue : { status: 'loading' } as any }
  );

  /* -------------------- SAFE SERVER SYNC -------------------- */

  syncFromServer = effect(() => {

    const res = this.blogResponse();
    console.log(res)

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

  selectedBlogId = signal<number | null>(null);

  openDeleteModal(blogId: number) {
    this.selectedBlogId.set(blogId);
  }

  deleteBlog(){

    let id = this.selectedBlogId();
    if(!id){
      return;
    }

    this.blogService.DeleteBlog(id).subscribe(
      {
        next: (res:any) => {
          window.location.reload();
        },
        error: (err:any) => alert(err.message)
      }
    )
  }
  


}
