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
  isAuthenticated = false;
  private authStatusSubject = new Subject<boolean>();
  constructor(private http: HttpClient, private router: Router) { }

  // TOKEN METHODS

  getToken() {
    return this.token;
  }

  // LOG METHODS

  createUser(email: string, password: string) {
    const authData: AuthData = {
      email,
      password
    };

    this.http.post('http://localhost:3000/api/user/signup', authData)
      .subscribe(response => {
        console.log(response);
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = {
      email,
      password
    };
    this.http.post<{token: string, expiresIn: number}>('http://localhost:3000/api/user/login', authData)
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if (token) {
          const expirationTime = response.expiresIn;
          this.setAuthTimer(expirationTime);
          this.authStatusSubject.next(true);
          this.isAuthenticated = true;
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expirationTime * 1000);
          this.saveAuthData(token, expirationDate);
          this.router.navigate([ '/']);

        }
      });
  }

  logout() {
    this.token = null;
    this.authStatusSubject.next(false);
    this.isAuthenticated = false;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
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
        this.authStatusSubject.next(true);
        this.isAuthenticated = true;
        this.setAuthTimer(expiresIn / 1000);
    }
  }

  // LOCALSTORAGE METHODS
  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');

    if (!token || !expirationDate) {
      return;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate)
    };
  }


}
