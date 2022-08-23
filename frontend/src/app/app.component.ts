import { Component } from '@angular/core';

import { LoginService } from './services/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'amaranth_ringup';

  loggedIn: boolean = false;

  constructor(
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.loginService.getIsLoggedIn()
       .subscribe(
         loggedIn => {
           this.loggedIn = loggedIn;
         }
       )
  }
}
