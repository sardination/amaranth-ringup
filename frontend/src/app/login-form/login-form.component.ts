import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {

  loginForm = new FormGroup({
    username: new FormControl(""),
    password: new FormControl("")
  });

  constructor(
    private router: Router,
    private loginService: LoginService,
  ) {

  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (!(this.loginForm.value.username && this.loginForm.value.password))
      return;
    this.loginService.login(
      this.loginForm.value.username,
      this.loginForm.value.password
    ).subscribe(
      loggedIn => {
        // this.formError = null;
        if (loggedIn) {
          this.router.navigateByUrl("");
        } else {
          // this.formError = "No user with this information has been found. Please check information and try again."
        }
      }
    );
  }

}
