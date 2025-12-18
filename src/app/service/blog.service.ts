import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { IBlog, ICreateBlog, IUpdateBlog } from '../models/blog.model';
import { paginatedResult } from '../models/paginatedResult.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  constructor() { }

  private http = inject(HttpClient);
  private router = inject(Router);

  GetAll(pageNumber = 1, pageSize = 10): Observable<paginatedResult<IBlog>>{

    let params = new HttpParams()
    .set('pageNumber', String(pageNumber))
    .set('pageSize', String(pageSize))
    return this.http.get<paginatedResult<IBlog>>('http://localhost:5105/api/Blog',{params}).pipe(
      map((res: any) => res.data)
    );
  };

  GetUserBlogs(userId: number, pageNumber = 1, pageSize = 10 ): Observable<IBlog[]>{

     let params = new HttpParams()
    .set('pageNumber', String(pageNumber))
    .set('pageSize', String(pageSize))

    console.log("api called")

    return this.http.get<IBlog[]>(`http://localhost:5105/api/blog/userBlogs/${userId}`,{params}).pipe(
      map((res: any) => res.data)
    )
  }

  GetById(id: number): Observable<IBlog>
  {
    return this.http.get<IBlog>(`http://localhost:5105/blog/${id}`).pipe(
      map((res: any) => res.data)
    )
  }

  CreateBlog(obj: ICreateBlog): Observable<string>{
    return this.http.post<any>('http://localhost:5105/api/Blog', obj)
  }

  UpdateBlog(obj: IUpdateBlog, userId: number): Observable<string>{
    return this.http.put<any>(`http://localhost:5105/api/Blog/${userId}`, obj)
  }

  DeleteBlog(id: number): Observable<string>{
    return this.http.delete<string>(`http://localhost:5105/api/Blog/${id}`)
  }

}
