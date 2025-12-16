import { Component, inject, signal } from '@angular/core';
import { BlogService } from '../../../service/blog.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Route } from '@angular/router';
import { switchMap, map } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-blog-details',
  imports: [ DatePipe, CommonModule],
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.css']
})
export class BlogDetailsComponent {

  blogService = inject(BlogService);
  route = inject(ActivatedRoute)

  blog = toSignal(
    this.route.paramMap.pipe(
      map((val: any) => Number(val.get('id'))),
      switchMap(id => this.blogService.GetById(id))
    ),
    { initialValue: null}
  )

}
