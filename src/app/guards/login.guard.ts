import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  
    const authService = inject(AuthService);
    const router = inject(Router)

    if(authService.isLoggedIn()){
        router.navigateByUrl('blog');
        return false;
    }

    return true;

};
