import { ReactionComponent } from './../../../shared/component/reaction/reaction.component';
import { Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { BlogService } from '../../../service/blog.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Route } from '@angular/router';
import { switchMap, map, tap } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { CommentComponent } from '../../../shared/component/comment/comment.component';
import { IBlog, ReactionType } from '../../../models/blog.model';
import { ReactionService } from '../../../service/reaction.service';

@Component({
  selector: 'app-blog-details',
  imports: [ DatePipe, CommonModule, CommentComponent ],
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.css']
})

export class BlogDetailsComponent {

  blogService = inject(BlogService);
  reactService = inject(ReactionService);
  route = inject(ActivatedRoute)

  ReactionType = ReactionType;

  private blogResponse = toSignal(
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      switchMap(id => this.blogService.GetById(id).pipe(
        tap(res => console.log(res))
      ))
    ),
    { initialValue: null }
  );

  blog = signal<IBlog | null>(null);

  syncBlog = effect(() => {
    const res = this.blogResponse();
    if (res) {
      this.blog.set(res);
    }
  });

  reactOptimistic(reaction: ReactionType) {
    const current = this.blog();
    if (!current) return;

    const prevReaction = current.userReaction;
    const prevLike = current.likeCounts;
    const prevDislike = current.dislikeCounts;

    const newReaction =
      prevReaction === reaction ? ReactionType.Null : reaction;

    let like = prevLike;
    let dislike = prevDislike;

    if (prevReaction === ReactionType.Liked) like--;
    if (prevReaction === ReactionType.Disliked) dislike--;

    if (newReaction === ReactionType.Liked) like++;
    if (newReaction === ReactionType.Disliked) dislike++;

    // ✅ OPTIMISTIC UI UPDATE
    this.blog.set({
      ...current,
      userReaction: newReaction,
      likeCounts: like,
      dislikeCounts: dislike
    });

    // ✅ SERVER CONFIRMATION
    this.reactService.react(current.id, newReaction).subscribe({
      next: (res: any) => {
        this.blog.set({
          ...current,
          userReaction: res.data.userReaction,
          likeCounts: res.data.like,
          dislikeCounts: res.data.dislike
        });
      },
      error: () => {
        // 🔁 rollback
        this.blog.set({
          ...current,
          userReaction: prevReaction,
          likeCounts: prevLike,
          dislikeCounts: prevDislike
        });
      }
    });
  }

  like(blogId: number) {
    this.reactOptimistic(ReactionType.Liked);
  }

  dislike(blogId: number) {
    this.reactOptimistic(ReactionType.Disliked);
  }

}
