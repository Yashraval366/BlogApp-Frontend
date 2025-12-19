import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef, runInInjectionContext, inject } from '@angular/core';
import { CommentNode } from '../../../models/comment.model';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-comment-item',
  standalone: true,
  imports: [DatePipe, FormsModule, CommonModule],
  templateUrl: './comment-item.component.html',
  styleUrls: ['./comment-item.component.css']
})
export class CommentItemComponent implements OnChanges, AfterViewInit {
  @Input() comment!: CommentNode;
  @Output() reply = new EventEmitter<{ parentId: number; content: string }>();

  auth = inject(AuthService);

  showReplyBox = false;
  replyText = '';

  // Read-more state
  expanded = false;
  isLong = false;
  measured = false;

  @ViewChild('contentEl', { static: false }) contentEl?: ElementRef<HTMLElement>;

  toggleReply() {
    this.showReplyBox = true;
  }

  cancel() {
    this.showReplyBox = false;
    this.replyText = '';
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  // Replies visibility toggle (show/hide nested replies)
  repliesVisible = true;

  toggleReplies() {
    this.repliesVisible = !this.repliesVisible;
  }

  ngAfterViewInit(): void {
    // measure once view is ready
    requestAnimationFrame(() => this.measure());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['comment']) {
      // re-measure when content changes after bindings update
      setTimeout(() => this.measure(), 0);
    }
  }

  private measure() {
    const el = this.contentEl?.nativeElement;
    if (!el) return;

    const style = window.getComputedStyle(el);
    let lineHeight = parseFloat(style.lineHeight);
    if (!lineHeight || isNaN(lineHeight)) {
      const fontSize = parseFloat(style.fontSize) || 14;
      lineHeight = fontSize * 1.45;
    }

    const maxLines = 3;
    const collapsedHeight = lineHeight * maxLines;
    const fullHeight = el.scrollHeight;

    const wasLong = this.isLong;
    this.isLong = fullHeight > collapsedHeight + 1; // small tolerance
    this.measured = true;
    if (!this.isLong) this.expanded = false; // ensure expanded reset when not long
    // only trigger change detection when value changed during an async measure
    if (wasLong !== this.isLong) {
      // nothing else required here; Angular will pick up the changes on next tick
    }
  }

  submitReply() {
    if (!this.replyText.trim()) return;

    this.reply.emit({
      parentId: this.comment.id,
      content: this.replyText
    });

    this.cancel();
  }
}
