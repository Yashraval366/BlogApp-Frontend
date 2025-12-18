import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReactionType } from '../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class ReactionService {

  constructor() { }

  private http = inject(HttpClient);

  react(blogId: number, reactionType: ReactionType): Observable<string>{
    return this.http.post<string>(`http://localhost:5105/api/BlogReaction/react`,{blogId, reactionType});
  }

  getReaction(blogId:number): Observable<{like: boolean, dislike: boolean}>{
    return this.http.get<{like: boolean, dislike: boolean}>(`http://localhost:5105/api/BlogReaction/ractions/${blogId}`)
  }

}
