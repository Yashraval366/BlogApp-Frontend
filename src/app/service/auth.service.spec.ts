import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { provideRouter, Router } from '@angular/router';
import { HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing'
import { provideHttpClient } from '@angular/common/http';


describe('AuthService', () => {
  let service: AuthService;  
  let httpMock: HttpTestingController;
  let routerMock: any;

  beforeEach(() => {

    routerMock = {
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    };

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: routerMock
        }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  //register api testing
  it('should call register API with POST', () => {
    const obj = {fullName: 'OnePunchMan', email: 'testing@test.com', password: 'Test@123'}

    service.Register(obj).subscribe();

    const req = httpMock.expectOne('http://localhost:5105/api/Auth/register');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(obj);

    req.flush({success: true});

  });

  //login api testing
  it('should call login API with POST', () => {
    const obj = {
      email: 'login@test.com',
      password: '123'
    }

    service.Login(obj).subscribe()

    const req = httpMock.expectOne('http://localhost:5105/api/Auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(obj);    


    req.flush({token: 'xyz' });

  });

  //setToken method tesing
  it('should save token and update isloggedIn Singal', () => {
    service.SetToken("token1234");

    expect(localStorage.getItem("token")).toBe('token1234');
    expect(service.isLoggedIn()).toBeTrue();
  });

  //GetToken() method testing
  it('should return token when exists', ()=> {
    localStorage.setItem("token","mytoken");
    expect(service.GetToken()).toBe("mytoken");
  });

  it('should return null when no token exist', () => {
    localStorage.removeItem("token");
    expect(service.GetToken()).toBeNull();
  });

  //HasToken() method testing
  it('should return true when token exists', () => {
    localStorage.setItem("token", 'ABC');
    expect(service.HasToken()).toBeTrue();
  })

  it('should return false when token not exists', () => {
    localStorage.removeItem("token");
    expect(service.HasToken()).toBeFalse();
  })

  //logout method testing
  it('should logout user, clear token, set signal false and navigate to login', ()=> {
    localStorage.setItem('token', 'DATA');

     service.logOut();

    expect(localStorage.getItem('token')).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  // isloggedIn signal initialization
  it("should initialize isloggedIn based on existing token", () => {
    localStorage.setItem('token', 'PRESET');

    const newService = TestBed.inject(AuthService);

    expect(newService.isLoggedIn()).toBeTrue();

  })

  afterEach(() => {
    httpMock.verify();
  });

});
