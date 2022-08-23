import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Router } from '@angular/router';

import { LoginService } from './services/login.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.loginService.getIsLoggedIn().pipe(
      map(loggedIn => {
        if (!route.routeConfig)
          return false;
        if (!loggedIn && route.routeConfig.path != "login") {
          return this.router.parseUrl('login');
        }
        // Redirect to ringup of logged in
        if (loggedIn && route.routeConfig.path == "login") {
          return this.router.parseUrl('');
        }
        return true;
      })
    );
  }
  
}
