import { AuthService } from './../../service/auth.service';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { of, throwError } from 'rxjs';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('RegisterComponent (Full Template Test)', () => {

  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockRouter: any;
  let mockAuth: any;
  let mockHttp: HttpTestingController;

  beforeEach(async () => {

    // Router mock must include everything RouterLink internally calls
    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
      createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({}),
      serializeUrl: jasmine.createSpy('serializeUrl').and.returnValue('/test'),
      isActive: jasmine.createSpy('isActive').and.returnValue(false),
      events: of()
    };

    mockAuth = {
      Register: jasmine.createSpy('Register').and.returnValue(of({ success: true }))
    };

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
      ],
      providers: [
        FormBuilder,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuth },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockHttp = TestBed.inject(HttpTestingController);
  });

  // -------------------------------------------------------
  // 1. Component should create
  // -------------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // -------------------------------------------------------
  // 2. Form Initialization
  // -------------------------------------------------------
  it('should initialize all form controls', () => {
    const form = component.registerForm;
    expect(form.contains('firstName')).toBeTrue();
    expect(form.contains('lastName')).toBeTrue();
    expect(form.contains('email')).toBeTrue();
    expect(form.contains('password')).toBeTrue();
    expect(form.contains('confirmPassword')).toBeTrue();
    expect(form.contains('agreeTerms')).toBeTrue();
  });

  // -------------------------------------------------------
  // 3. Password mismatch validator
  // -------------------------------------------------------
  it('should detect password mismatch', () => {

    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      password: 'Secret@123',
      confirmPassword: 'WrongPass',
      agreeTerms: true
    });

    const errors = component.passwordMatchValidator(component.registerForm);
    expect(errors).toEqual({ passwordMismatch: true });
  });

  it('should return null when password matches', () => {

    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      password: 'Secret@123',
      confirmPassword: 'Secret@123',
      agreeTerms: true
    });

    const errors = component.passwordMatchValidator(component.registerForm);
    expect(errors).toBeNull();
  });

  // -------------------------------------------------------
  // 4. Toggle password visibility
  // -------------------------------------------------------
  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
  });

  it('should toggle confirm password visibility', () => {
    expect(component.showConfirmPassword).toBeFalse();
    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword).toBeTrue();
  });

  // -------------------------------------------------------
  // 5. Update password strength
  // -------------------------------------------------------
  it('should update password strength correctly', () => {
    component.registerForm.get('password')?.setValue('Aa1!aaaa');
    component.updatePasswordStrength();

    expect(component.passwordStrength.minLength).toBeTrue();
    expect(component.passwordStrength.hasUpperCase).toBeTrue();
    expect(component.passwordStrength.hasLowerCase).toBeTrue();
    expect(component.passwordStrength.hasNumber).toBeTrue();
    expect(component.passwordStrength.hasSpecialChar).toBeTrue();
  });

  // -------------------------------------------------------
  // 6. onSubmit should not proceed if form invalid
  // -------------------------------------------------------
  it('should not submit when form is invalid', () => {
    component.registerForm.patchValue({ firstName: '' }); // invalid
    component.onSubmit();

    expect(component.errorMessage).toBe('Please fill in all required fields correctly');
    expect(mockAuth.Register).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // 7. Should call authService.Register on valid form
  // -------------------------------------------------------
  it('should call authService.Register on valid submit', fakeAsync(() => {

    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      password: 'Secret@123',
      confirmPassword: 'Secret@123',
      agreeTerms: true
    });

    component.onSubmit();
    tick(1500); // simulate timeout

    expect(mockAuth.Register).toHaveBeenCalled();
  }));

  // -------------------------------------------------------
  // 8. Should navigate to login after success
  // -------------------------------------------------------
  it('should navigate to /login after successful registration', fakeAsync(() => {

    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      password: 'Secret@123',
      confirmPassword: 'Secret@123',
      agreeTerms: true
    });

    component.onSubmit();
    tick(1500); // first timeout
    tick(1500); // redirection timeout

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should toggle password visibility', () => {
  expect(component.showPassword).toBeFalse();
  component.togglePasswordVisibility();
  expect(component.showPassword).toBeTrue();
  });

  it('should toggle confirm password visibility', () => {
    expect(component.showConfirmPassword).toBeFalse();
    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword).toBeTrue();
  });

  // updatePasswordStrength()
  it('should update password strength values', () => {
    component.registerForm.get('password')?.setValue('Aa1!aaaa');
    component.updatePasswordStrength();

    expect(component.passwordStrength.minLength).toBeTrue();
    expect(component.passwordStrength.hasUpperCase).toBeTrue();
    expect(component.passwordStrength.hasLowerCase).toBeTrue();
    expect(component.passwordStrength.hasNumber).toBeTrue();
    expect(component.passwordStrength.hasSpecialChar).toBeTrue();
  });

  // getPasswordStrengthPercentage()
  it('should return correct password strength percentage', () => {
    component.passwordStrength = {
      minLength: true,
      hasUpperCase: true,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false
    };

    const percent = component.getPasswordStrengthPercentage();
    expect(percent).toBe(40);  // 2 out of 5 = 40%
  });

  // getPasswordStrengthLabel()
  it('should return correct strength label', () => {
  component.passwordStrength = {
    minLength: true,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  };
  expect(component.getPasswordStrengthLabel()).toBe('Weak'); // 20%

  component.passwordStrength = {
    minLength: true,
    hasUpperCase: true,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  };
  expect(component.getPasswordStrengthLabel()).toBe('Fair'); // 40%

  component.passwordStrength = {
    minLength: true,
    hasUpperCase: true,
    hasLowerCase: true,
    hasNumber: false,
    hasSpecialChar: false
  };
  expect(component.getPasswordStrengthLabel()).toBe('Good'); // 60%

  component.passwordStrength = {
    minLength: true,
    hasUpperCase: true,
    hasLowerCase: true,
    hasNumber: true,
    hasSpecialChar: true
  };

  expect(component.getPasswordStrengthLabel()).toBe('Strong');

  });

  // getPasswordStrengthColor()
  it('should return correct strength color', () => {

    const labelSpy = spyOn(component, 'getPasswordStrengthLabel')
    labelSpy.and.returnValue('Good');
    expect(component.getPasswordStrengthColor()).toBe('#ffc107');

    labelSpy.and.returnValue('Weak');
    expect(component.getPasswordStrengthColor()).toBe('#dc3545');

    labelSpy.and.returnValue('Fair');
    expect(component.getPasswordStrengthColor()).toBe('#fd7e14');

    labelSpy.and.returnValue('Strong');
    expect(component.getPasswordStrengthColor()).toBe('#28a745');

    labelSpy.and.returnValue('');
    expect(component.getPasswordStrengthColor()).toBe('#6c757d');

  });

  // onSubmit should not call Register when form invalid
  it('should NOT call Register when form invalid', () => {
    component.registerForm.patchValue({ firstName: '' });

    component.onSubmit();

    expect(component.errorMessage).toBe('Please fill in all required fields correctly');
    expect(mockAuth.Register).not.toHaveBeenCalled();
  });

  // onSubmit should call authService.Register when valid
  it('should call authService.Register when form valid', fakeAsync(() => {

    component.registerForm.setValue({
      firstName: 'Aa',
      lastName: 'Bb',
      email: 'a@a.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      agreeTerms: true
    });

    component.onSubmit();

    tick(1500); // simulate async timeout

    expect(mockAuth.Register).toHaveBeenCalled();
  }));

  //should register user successfully
  it('should register user successfully', fakeAsync(() => {

   // spy on console.log
    spyOn(console, 'log');

    const mockError = { message: 'User already exists' };

  // mock Register to emit error
    mockAuth.Register.and.returnValue(
      throwError(() => ({ error: mockError }))
    );

    // valid form data
    component.registerForm.setValue({
      firstName: 'Aa',
      lastName: 'Bb',
      email: 'a@a.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      agreeTerms: true
    });

    // call onSubmit
    component.onSubmit();

    // run the setTimeout in onSubmit
    tick(1500);

    // ASSERT: error callback was executed
    expect(console.log).toHaveBeenCalledWith(mockError);

    // ALSO ASSERT: successMessage should NOT be set (optional)
    expect(component.successMessage).toBe('');

    }));

    it('should NOT trigger inner failure when form invalid', () => {
    component.registerForm.patchValue({ email: '' });

    component.onSubmit();

    expect(component.errorMessage).toBe('Please fill in all required fields correctly');
  });

  // should navigate to login after success
  it('should navigate to /login after successful registration', fakeAsync(() => {

    component.registerForm.setValue({
      firstName: 'Aa',
      lastName: 'Bb',
      email: 'a@a.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      agreeTerms: true
    });

    component.onSubmit();

    tick(1500); 
    tick(1500)

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  }));

});
