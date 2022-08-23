import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SHA1, enc } from 'crypto-js';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private queryURL = `${environment.apiBase}/login`;

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<boolean> {
    // TODO: change this to SHA512 with salt
    let hashedPassword = SHA1(password).toString(enc.Hex);
    return this.http.post<boolean>(
      this.queryURL,
      {username: username, password: hashedPassword}
    );
  }

  logout(): Observable<boolean> {
    return this.http.delete(
      this.queryURL
    ).pipe(
      map(res => true),
      catchError(error => of(false))
    );
  }

  getIsLoggedIn(): Observable<boolean> {
    return this.http.get<boolean>(this.queryURL);
  }
}
