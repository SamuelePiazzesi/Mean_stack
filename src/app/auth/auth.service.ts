import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthData } from './auth-data.model';
import { Router } from '@angular/router';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string;
  private tokenTimer: any;
  private userId: string;
  private username: string;
  isAuthenticated = false;
  isUsername = false;
  private authStatusSubject = new Subject<boolean>();
  constructor(private http: HttpClient, private router: Router) { }

  // TOKEN METHODS

  getToken() {
    return this.token;
  }

  // USERID METHODS

  getUserId() {
    return this.userId;
  }

  // USERNAME METHODS

  getUserName() {
    return this.username;
  }

  // LOG METHODS

  createUser(email: string, password: string, username: string) {
    const authData: AuthData = {
      email,
      password,
    };

    const userData = {
      authData: authData,
      username: username
    };

   this.http.post('http://localhost:3000/api/user/signup', userData)
     .subscribe( () => {
       this.router.navigate(['/']);
     },
     error => {
       this.authStatusSubject.next(false);
     });
  }

  login(email: string, password: string) {
    const authData: AuthData = {
      email,
      password,

    };
    this.http.post<{token: string, expiresIn: number, userId: string, username: string}>('http://localhost:3000/api/user/login', authData)
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if (token) {
          const expirationTime = response.expiresIn;
          this.setAuthTimer(expirationTime);
          this.authStatusSubject.next(true);
          this.isAuthenticated = true;
          this.userId = response.userId;
          this.username = response.username;
          this.isUsername = true;
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expirationTime * 1000);
          this.saveAuthData(token, expirationDate, this.userId, this.username);
          this.router.navigate([ '/']);

        }
      }, error => {
        this.authStatusSubject.next(false);
      });
  }

  logout() {
    this.token = null;
    this.authStatusSubject.next(false);
    this.isUsername = false;
    this.isAuthenticated = false;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.username = null;
    this.router.navigate([ '/']);
  }



  // AUTENTICATION METHODS


  // uso il subject authStusSubject come observable per far passare gli eventi di autenticazione nella UI
  getAuthStatusListener() {
    return this.authStatusSubject.asObservable();
  }


  // ritorno il boolean is Authenticated per la UI
  getisAuthenticated() {
    return this.isAuthenticated;
  }

  getIsUserName() {
    return this.isUsername;
  }

  // qui imposto il timer per la disconessione in automatico
  private setAuthTimer(timer: number) {
    console.log(timer);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, timer * 1000);
  }



  // questo è il metodo che mi permette di autenticarmi in automatico se ho un token e un expirationtime nel localstorage del browser
  autoAuthUser() {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    const now = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
        this.token = authInfo.token;
        this.userId = authInfo.userId;
        this.username = authInfo.username;
        this.authStatusSubject.next(true);
        this.isAuthenticated = true;
        this.isUsername = true;
        this.setAuthTimer(expiresIn / 1000);
    }
  }

  // LOCALSTORAGE METHODS
  private saveAuthData(token: string, expirationDate: Date, userId: string, username: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    if (!token || !expirationDate) {
      return;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      username: username
    };
  }


}
