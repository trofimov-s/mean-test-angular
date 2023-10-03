import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token!: string | null;
  private authStatus = new BehaviorSubject<boolean>(false);
  private tokenTimer!: ReturnType<typeof setTimeout>;
  private _userId$ = new BehaviorSubject<string>('');

  get token(): string | null {
    return this._token;
  }

  get userId$(): Observable<string> {
    return this._userId$;
  }

  getAuthStatusListener(): Observable<boolean> {
    return this.authStatus.asObservable();
  }

  constructor(private http: HttpClient, private router: Router) {}

  createUser(email: string, password: string) {
    return this.http
      .post(environment.apiUrl + 'user/signup', { email, password })
      .pipe(tap(() => this.router.navigate([''])));
  }

  login(email: string, password: string) {
    return this.http
      .post<{ token: string; expiresIn: number; userId: string }>(
        environment.apiUrl + 'user/login',
        {
          email,
          password,
        }
      )
      .pipe(
        tap((resp) => {
          this._userId$.next(resp.userId);
          const expiresInDuration = resp.expiresIn;

          this.setAuthTimer(expiresInDuration);

          const token = resp.token;
          this._token = token;
          const now = new Date();
          const expirationDate = new Date(
            now.getTime() + expiresInDuration * 1000
          );
          this.saveAuthData(token, expirationDate, resp.userId);
          this.authStatus.next(true);
          this.router.navigate(['']);
        })
      );
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();

    if (authInfo) {
      const expiresIn =
        authInfo.expirationDate.getTime() - new Date().getTime();
      if (expiresIn > 0) {
        this._token = authInfo.token;
        this.authStatus.next(true);
        this.setAuthTimer(expiresIn / 1000);
        this._userId$.next(authInfo.userId);
      }
    }
  }

  logout() {
    this._token = null;
    this.authStatus.next(false);
    this._userId$.next('');

    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }

    this.clearAuthData();
    this.router.navigate(['']);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (token && expiration && userId) {
      return { token, expirationDate: new Date(expiration), userId };
    }

    return;
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }
}
