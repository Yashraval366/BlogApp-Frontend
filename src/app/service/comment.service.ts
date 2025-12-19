import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IComment } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor() { }

  private http = inject(HttpClient);

  postComment(blogId: number, content: string, parentCommentId: number | null = null): Observable<IComment>{
    return this.http.post<IComment>("http://localhost:5105/api/Comment/comment", {blogId, content, parentCommentId}).pipe(
      map((res:any) => res.data)
    );
  }

  getComments(blogId: number): Observable<IComment[]>{
    return this.http.get<IComment[]>(`http://localhost:5105/api/Comment/${blogId}/comments`).pipe(
      map((res:any) => res.data)
    );
  }

}
