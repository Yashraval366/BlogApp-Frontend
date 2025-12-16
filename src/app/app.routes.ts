import { BlogComponent } from './components/blog/blog.component';
import { Routes, CanActivateFn } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MyBlogsComponent } from './components/blog/my-blogs/my-blogs.component';
import { CreateBlogComponent } from './components/blog/create-blog/create-blog.component';
import { EditBlogComponent } from './components/blog/edit-blog/edit-blog.component';
import { BlogDetailsComponent } from './components/blog/blog-details/blog-details.component';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [

    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [loginGuard]
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'blog',
        component: BlogComponent,
        canActivate: [authGuard]
    },
    {
        path: 'my-blogs/:userId',
        component: MyBlogsComponent,
        canActivate: [authGuard],
    },
    {
        path: 'create-blog',
        component: CreateBlogComponent,
        canActivate: [authGuard],
    },
    {
        path: 'edit-blog/:id',
        component: EditBlogComponent,
        canActivate: [authGuard],
    },
    {
        path: 'blog-details/:id',
        component: BlogDetailsComponent,
        canActivate: [authGuard],
    },
    {
        path: '**',
        component: LoginComponent
    }
];
