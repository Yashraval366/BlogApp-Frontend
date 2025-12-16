import { AuthService } from './service/auth.service';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router, ActivatedRoute, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private authService = inject(AuthService);
  toastr = inject(ToastrService)

  ngOnInit(){
    
  }

  title = 'BlogApp';
  isLoggedIn = this.authService.isLoggedIn;
  userName: string | null = this.getUserNameFromToken();
  userId: string | null = this.getUserIdFromToken();
  isNavbarOpen = false;

  private router = inject(Router);

  private getUserNameFromToken(): string | null {
    const token = this.authService.GetToken();
    if (!token) return null;

    try {

      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));

      return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"] || null;

    } catch (e) {
      return null;
    }
  }

  private getUserIdFromToken(): string | null {
    const token = this.authService.GetToken();
    if (!token) return null;

    try {

      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));

      return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;

    } catch (e) {
      return null;
    }
  }

  logout() {
    this.authService.logOut();
  }

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen;
  }

  closeNavbar() {
    this.isNavbarOpen = false;
  }

  ngOnDestroy(){
    this.authService.logOut();
  }

}
