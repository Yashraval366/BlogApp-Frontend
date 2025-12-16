import { IUserRegister } from './../../models/user.model';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent {
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Password strength indicators
  passwordStrength = {
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  constructor(private fb: FormBuilder, private router: Router) {
    this.initializeForm();
  }

  authService = inject(AuthService);

  initializeForm() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      agreeTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator.bind(this) });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  updatePasswordStrength() {
    const password = this.registerForm.get('password')?.value || '';
    
    this.passwordStrength.minLength = password.length >= 8;
    this.passwordStrength.hasUpperCase = /[A-Z]/.test(password);
    this.passwordStrength.hasLowerCase = /[a-z]/.test(password);
    this.passwordStrength.hasNumber = /[0-9]/.test(password);
    this.passwordStrength.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  getPasswordStrengthPercentage(): number {
    const criteria = Object.values(this.passwordStrength);
    return (criteria.filter(c => c).length / criteria.length) * 100;
  }

  getPasswordStrengthLabel(): string {
    const percentage = this.getPasswordStrengthPercentage();
    if (percentage < 40) return 'Weak';
    if (percentage < 60) return 'Fair';
    if (percentage < 80) return 'Good';
    return 'Strong';
  }

  getPasswordStrengthColor(): string {
    const label = this.getPasswordStrengthLabel();
    switch (label) {
      case 'Weak': return '#dc3545';
      case 'Fair': return '#fd7e14';
      case 'Good': return '#ffc107';
      case 'Strong': return '#28a745';
      default: return '#6c757d';
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Simulate registration - replace with actual API call
    const { firstName, lastName, email, password } = this.registerForm.value;
    
    setTimeout(() => {
      if (email && password && firstName && lastName) {
        
        let newUser: IUserRegister = {
          fullName:  firstName + " " + lastName,
          email:  email,
          password: password
        }

        this.authService.Register(newUser).subscribe({
        next: (res) => {
          console.log(res);

          this.isLoading = false;
          this.successMessage = 'Registration successful! Redirecting to login...';

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (err) => {
          console.log(err.error);

          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        }
    });
      } else {
        this.errorMessage = 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    }, 1500);
  }

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get agreeTerms() {
    return this.registerForm.get('agreeTerms');
  }
}
