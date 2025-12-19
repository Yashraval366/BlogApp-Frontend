import { CommentNode, IComment } from './../../../models/comment.model';
import { Component, computed, effect, inject, Input, Signal } from '@angular/core';
import { CommentService } from '../../../service/comment.service';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, switchMap, tap } from 'rxjs';
import { signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../../service/auth.service';
import { CommentItemComponent } from '../comment-item/comment-item.component';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [FormsModule, CommentItemComponent, CommonModule],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent {

  private commentService = inject(CommentService);
  private auth = inject(AuthService);
  userId = this.auth.getUserId();
  userName = this.auth.getUserName();

  content = '';

  private blogIdSignal = signal<number | null>(null);

  @Input({ required: true }) set blogId(value: number) {
    this.blogIdSignal.set(value);
  }

  allComments = toSignal(
    toObservable(this.blogIdSignal).pipe(
      filter((id): id is number => id !== null),
      switchMap(id => this.commentService.getComments(id))
    ),
    { initialValue: [] }
  );

  commentsState = signal<IComment[]>([]);

  syncComments = effect(() => {
    const server = this.allComments();
    this.commentsState.set(server);
  });

  comments = computed(() =>
    this.commentsState().filter(c => c.parentCommentId === null)
  );

  replies = computed(() =>
    this.commentsState().filter(c => c.parentCommentId !== null)
  );

  repliesByParent = computed(() => {

    const map = new Map<number, IComment[]>();

    for (const r of this.replies()) {
      const parentId = r.parentCommentId!;
      if (!map.has(parentId)) {
        map.set(parentId, []);
      }
      map.get(parentId)!.push(r);
    }

    return map;

  });

  replyingTo = signal<number | null>(null);

  replyText = ''

  openReply(commentId: number) {
    this.replyingTo.set(commentId);
    this.replyText = ''
  }

  cancelReply() {
    this.replyingTo.set(null);
    this.replyText = ''
  }

  private createOptimisticComment(
    content: string,
    parentCommentId: number | null
  ): IComment {

    return {
      id: -Date.now(),               
      blogId: this.blogIdSignal()!,
      parentCommentId,
      content,
      createdAt: new Date().toISOString(),
      userId: this.userId!,
      userName: this.userName!,
      isOptimistic: true,
      lastUpdatedAt: null
    };
  }

  onPost() {
    const content = this.content.trim();
    if (!content) return;

    const optimistic = this.createOptimisticComment(content, null);

    // ✅ optimistic UI
    this.commentsState.update(list => [optimistic, ...list]);
    this.content = '';

    // 🔁 API call
    this.commentService
      .postComment(this.blogIdSignal()!, content, null)
      .subscribe({
        next: (real) => {
          // replace temp comment
          this.commentsState.update(list =>
            list.map(c => c.id === optimistic.id ? real : c)
          );
        },
        error: () => {
          // rollback
          this.commentsState.update(list =>
            list.filter(c => c.id !== optimistic.id)
          );
          alert('Failed to post comment');
        }
      });
  }

  onReply(parentCommentId: number, replyText: string) {

    const content = replyText.trim();
    if (!content) return;

    const optimistic = this.createOptimisticComment(
      content,
      parentCommentId
    );

    // ✅ optimistic UI
    this.commentsState.update(list => [...list, optimistic]);

    // 🔁 API call
    this.commentService
      .postComment(this.blogIdSignal()!, content, parentCommentId)
      .subscribe({
        next: (real) => {
          this.commentsState.update(list =>
            list.map(c => c.id === optimistic.id ? real : c)
          );
        },
        error: () => {
          this.commentsState.update(list =>
            list.filter(c => c.id !== optimistic.id)
          );
          alert('Failed to reply');
        }
      });
  }

  commentTree = computed<CommentNode[]>(() => {
    const list = this.commentsState();

    const map = new Map<number, CommentNode>();

    // 1️⃣ Initialize nodes
    for (const c of list) {
      map.set(c.id, { ...c, replies: [] });
    }

    const roots: CommentNode[] = [];

    // 2️⃣ Link parents
    for (const node of map.values()) {
      if (node.parentCommentId) {
        map.get(node.parentCommentId)?.replies.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;

  });

  onNestedReply(event: { parentId: number; content: string }) {

    const optimistic = this.createOptimisticComment(
      event.content,
      event.parentId
    );

    // optimistic insert
    this.commentsState.update(list => [...list, optimistic]);

    this.commentService
      .postComment(this.blogIdSignal()!, event.content, event.parentId)
      .subscribe({
        next: real => {
          this.commentsState.update(list =>
            list.map(c => c.id === optimistic.id ? real : c)
          );
        },
        error: () => {
          this.commentsState.update(list =>
            list.filter(c => c.id !== optimistic.id)
          );
        }
      });
  }

}

