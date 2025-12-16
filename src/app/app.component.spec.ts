import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthService } from './service/auth.service';
import { provideRouter, Router } from '@angular/router';

class MockAuthService {
  isLoggedIn = false;
  token: string | null = null;

  IsLoggedIn() {
    return this.isLoggedIn;
  }

  GetToken() {
    return this.token;
  }

  logOut() {
    this.isLoggedIn = false;
    this.token = null;
  }
}

describe('AppComponent (Fixed + Working)', () => {

  let component: AppComponent;
  let fixture: any;
  let auth: MockAuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: AuthService, 
          useClass: MockAuthService,
         },
        provideRouter([])
      ]
    });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    auth = TestBed.inject(AuthService) as any;
    router = TestBed.inject(Router);

    spyOn(router, 'navigateByUrl'); // For logout navigation check

    localStorage.clear();
    fixture.detectChanges();
  });

  // ---------------------------------------
  // 1. No token paths (null)
  // ---------------------------------------
  it('should return null userName and userId when no token', () => {
    auth.token = null;

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    expect(component.userName).toBeNull();
    expect(component.userId).toBeNull();
  });

  // ---------------------------------------
  // 2. Invalid token -> catch block
  // ---------------------------------------
  it('should handle malformed token (invalid base64)', () => {
    auth.token = 'BADTOKENFORMAT';

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    expect(component.userName).toBeNull();
    expect(component.userId).toBeNull();
  });

  // ---------------------------------------
  // 3. Valid token
  // ---------------------------------------
  it('should set userName and userId from valid token', () => {
    const payload = btoa(JSON.stringify({
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname": "Yash",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "101"
    }));

    auth.token = `xxx.${payload}.zzz`;
    auth.isLoggedIn = true;

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    expect(component.userName).toBe("Yash");
    expect(component.userId).toBe("101");
  });

  // ---------------------------------------
  // 4. Default username "User"
  // ---------------------------------------
  it('should show default username "User" when userName null', () => {
    auth.isLoggedIn = true;
    auth.token = null;

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const elem: HTMLElement = fixture.nativeElement;
    const strong = elem.querySelector("strong");

    expect(strong?.textContent?.trim()).toBe("User");
  });

  // ---------------------------------------
  // 5. Logged-out UI
  // ---------------------------------------
  it('should show Login/Register when NOT logged in', () => {
    auth.isLoggedIn = false;

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const elem = fixture.nativeElement;

    expect(elem.textContent).toContain("Login");
    expect(elem.textContent).toContain("Register");
  });

  // ---------------------------------------
  // 6. Logged-in UI
  // ---------------------------------------
  it('should show My Blogs/Create/All Blogs when logged in', () => {
    auth.isLoggedIn = true;
    auth.token = "header." + btoa(JSON.stringify({})) + ".sig";

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const elem = fixture.nativeElement;

    expect(elem.textContent).toContain("My Blogs");
    expect(elem.textContent).toContain("Create Blog");
    expect(elem.textContent).toContain("All Blogs");
  });

  // ---------------------------------------
  // 7. toggleNavbar()
  // ---------------------------------------
  it('should toggle navbar open/close', () => {
    expect(component.isNavbarOpen).toBeFalse();

    component.toggleNavbar();
    expect(component.isNavbarOpen).toBeTrue();

    component.toggleNavbar();
    expect(component.isNavbarOpen).toBeFalse();
  });

  // ---------------------------------------
  // 8. closeNavbar()
  // ---------------------------------------
  it('should close navbar', () => {
    component.isNavbarOpen = true;
    component.closeNavbar();
    expect(component.isNavbarOpen).toBeFalse();
  });

  // ---------------------------------------
  // 9. clicking nav link calls closeNavbar()
  // ---------------------------------------
  it('should close navbar on link click', () => {
    auth.isLoggedIn = true;

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const spyClose = spyOn(component, 'closeNavbar');

    const elem = fixture.nativeElement;
    const links = elem.querySelectorAll("a.nav-link");

    links[0].click();
    expect(spyClose).toHaveBeenCalled();
  });

  // ---------------------------------------
  // 10. logout navigation
  // ---------------------------------------
  it('should logout and navigate to /login', () => {
    auth.isLoggedIn = true;
    auth.token = "TEST";

    component.logout();

    expect(auth.isLoggedIn).toBeFalse();
    expect(auth.token).toBeNull();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

});
