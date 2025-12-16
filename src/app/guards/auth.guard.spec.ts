import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter, Router } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from '../service/auth.service';

describe('authGuard', () => {

  let mockAuth: any;
  let mockRouter: any;

  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {

    mockAuth = {
      isLoggedIn: jasmine.createSpy('isLoggedIn')
    };

    mockRouter = {
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    };


    TestBed.configureTestingModule({
      providers: [
        {
          provide:AuthService,
          useValue: mockAuth
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        provideRouter([]),
      ]
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should block activation and redirect when use is logged in', () => {
    
    mockAuth.isLoggedIn.and.returnValue(false);

    const result = executeGuard({} as any, {} as any);

    expect(result).toBeTrue();
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should block activation and redirect when user is logged in', () => {

    mockAuth.isLoggedIn.and.returnValue(true);

    const result = executeGuard({} as any, {} as any);

    expect(result).toBeFalse();
    expect(mockRouter.navigateByUrl).toHaveBeenCalled();
    
  })
});
