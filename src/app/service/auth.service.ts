import { IUserLogin, IUserRegister } from './../models/user.model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor() { }

  private http = inject(HttpClient)
  private router = inject(Router)

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

}
