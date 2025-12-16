import { loadState, LoadState } from './../../../shared/state/load-state';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '../../../service/blog.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { IBlog } from '../../../models/blog.model';
import { FormsModule, ɵInternalFormsSharedModule } from "@angular/forms";

@Component({
  selector: 'app-my-blogs',
  imports: [DatePipe, RouterLink, CommonModule, FormsModule],
  templateUrl: './my-blogs.component.html',
  styleUrls: ['./my-blogs.component.css']
})
export class MyBlogsComponent {

  private blogService = inject(BlogService)
  private route = inject(ActivatedRoute);


  blogStatus = toSignal<LoadState<IBlog[]>>(
    this.route.paramMap.pipe(
    map(val => Number(val.get('userId'))),
    switchMap(id => 
      loadState(this.blogService.GetUserBlogs(id), 1000),
    ),
    tap(res => console.log(res))
  ),
    {
      initialValue: { status: 'loading'} as any
    }
  )

  blogs = computed(() => {
    const s = this.blogStatus();
    return s?.status === 'success' && Array.isArray(s.data) ? s.data : [];
  });

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
