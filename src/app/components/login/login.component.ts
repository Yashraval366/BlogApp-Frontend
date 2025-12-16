import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { IUserLogin } from '../../models/user.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.initializeForm();
  }

  private authService = inject(AuthService);
  toastr = inject(ToastrService);

  initializeForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly';
      this.toastr.error("Invalid credentials", "Login Failed");
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simulate login - replace with actual API call
    const { email, password } = this.loginForm.value;
    
    setTimeout(() => {
      
      if (email && password) {
        
        let logUser: IUserLogin = {
          email: email,
          password: password
        }

        this.authService.Login(logUser).subscribe(
          {
            next: ((res)=> {
              console.log(res); 
              this.authService.SetToken(res.data.token); 
              this.isLoading = false;
              this.toastr.success("Welcome back!", "Login Successful");
              this.router.navigate(['/blogs'])
              window.location.reload()
            }),
            error: ((err) => console.log(err.error))
          }
        );
        
      } else {
        this.errorMessage = 'Invalid credentials';
        this.isLoading = false;
      }
    }, 1000);
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
