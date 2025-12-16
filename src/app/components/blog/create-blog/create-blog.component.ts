import { CommonModule} from '@angular/common';
import { Component, inject } from '@angular/core';
import { BlogService } from '../../../service/blog.service';
import { CategoryStore } from '../../../stores/category.store';
import { Router, RouterLink } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICreateBlog } from '../../../models/blog.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-blog',
  imports: [ CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './create-blog.component.html',
  styleUrls: ['./create-blog.component.css']
})
export class CreateBlogComponent {

  private blogService = inject(BlogService);
  store = inject(CategoryStore);
  private fb = inject(FormBuilder);
  router = inject(Router);
  toastr = inject(ToastrService);

  blogForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    categoryId: [0, [Validators.required]],
    visibility: ['', [Validators.required]]
  });

  onSubmit(){
    console.log(this.blogForm.value)
    let obj: ICreateBlog = {
      title: this.blogForm.value.title!,
      description: this.blogForm.value.description!,
      categoryId: this.blogForm.value.categoryId!,
      blogVisibility: this.blogForm.value.visibility!
    };

    this.blogService.CreateBlog(obj).subscribe(
      {
        next: ((res: any) => {
          alert(res.message);
          this.toastr.success("Blog published successfully")
          this.router.navigateByUrl('/blog')
        }),
        error: ((err)=> console.log(err.error))
      }
    );

  }

}
