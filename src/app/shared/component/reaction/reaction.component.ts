import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactionType } from '../../../models/blog.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reaction',
  imports: [CommonModule],
  templateUrl: './reaction.component.html',
  styleUrl: './reaction.component.css'
})
export class ReactionComponent {

  @Input({ required: true }) likeCount!: number;
  @Input({ required: true }) dislikeCount!: number;
  @Input({ required: true }) userReaction!: ReactionType;

  @Output() like = new EventEmitter<void>();
  @Output() dislike = new EventEmitter<void>();

  ReactionType = ReactionType;
  
}
