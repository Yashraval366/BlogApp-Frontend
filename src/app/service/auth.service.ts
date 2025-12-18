import { IUserLogin, IUserRegister } from './../models/user.model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userId.set(
        Number(
          decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        )
      );
    }
  }

  private http = inject(HttpClient)
  private router = inject(Router)

  private userId = signal<number | null>(null);

  isLoggedIn = signal(this.HasToken());

  Register(obj: IUserRegister): Observable<any> {
    return this.http.post<IUserRegister>('http://localhost:5105/api/Auth/register',obj)
  }

  Login(obj: IUserLogin): Observable<any>{
    return this.http.post<IUserLogin>('http://localhost:5105/api/Auth/login',obj)
  }

  SetToken(token: string)
  {
    localStorage.setItem("token", token);
    this.isLoggedIn.set(true);
  }

  GetToken(): string | null{
    return localStorage.getItem("token");
  }

  HasToken(): boolean{
    return !!localStorage.getItem("token");
  }

  logOut(){
    localStorage.clear();
    this.isLoggedIn.set(false);
    this.router.navigateByUrl('/login');
  }

  getUserId() {
    return this.userId();
  }

}
