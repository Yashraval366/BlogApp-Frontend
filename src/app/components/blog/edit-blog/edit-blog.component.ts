import { CategoryStore } from './../../../stores/category.store';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BlogService } from '../../../service/blog.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUpdateBlog } from '../../../models/blog.model';
import { effect } from '@angular/core';
@Component({
  selector: 'app-edit-blog',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edit-blog.component.html',
  styleUrls: ['./edit-blog.component.css']
})
export class EditBlogComponent {

  private blogService = inject(BlogService)
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  categoryStore = inject(CategoryStore);
  fb = inject(FormBuilder);

  editForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    categoryId: [null as number | null, [Validators.required]],
    visibility: ['', [Validators.required]]
  })

  blog = toSignal(
    this.route.paramMap.pipe(
      map((val:any) => Number(val.get('id'))),
      switchMap(id => this.blogService.GetById(id)),
    ),
    {
      initialValue : null
    }
  )
  
 // 🔥 Signal-reactive patch
  constructor() {
    effect(() => {
      const blog = this.blog();
      if (!blog) return;
      let visibilityInStr: string;
      if(blog.blogVisibility === 0){
        visibilityInStr = 'Public'
      }else{
        visibilityInStr = 'Private'
      }

      this.editForm.patchValue({
        title: blog.title,
        description: blog.description,
        categoryId: blog.categoryId,
        visibility: visibilityInStr
      });
    });
  }

  onSubmit(){
    
    let obj: IUpdateBlog = {
      title: this.editForm.value.title!,
      description: this.editForm.value.description!,
      categoryId: this.editForm.value.categoryId!,
      blogVisibility: this.editForm.value.visibility!,
    }

    let id = this.blog()?.id

    this.blogService.UpdateBlog(obj,id!).subscribe({
      next: (res:any) => {
        console.log(res);
        alert(res.message);
      },
      error: (err => console.log(err.error))
    })
  }

}
