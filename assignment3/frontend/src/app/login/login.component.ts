import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {AuthService} from '../auth.service';
import { RouterModule , Router} from '@angular/router';
import {FavourService} from '../favour.service';

// const backend = "https://csci571-assignment3-824257223293.us-west2.run.app"
const backend = "http://localhost:3000";
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginComponent {

  LoginForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient,private authService: AuthService, private router: Router, private favourite: FavourService) {
    this.LoginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.LoginForm.valid) {
      console.log(this.LoginForm.value);
      // const backendUrl = 'http://localhost:3000/login';
      const backendUrl = `${backend}/login`;
      this.http.post<{user:any}>(backendUrl, this.LoginForm.value, { withCredentials: true }).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.authService.updateUserProfile(response.user); // Update user profile on successful login
          console.log('now passing to favourite page');
          this.favourite.loadFavorites(); // Load favorite artists after login
          this.router.navigate(['/search']);
        },
        error: (error) => {
          // handle the email already exists error here
          console.log('Login error:', error.error);
          if (error.status === 401 && error.error.error === 'Invalid email or password') {
            this.LoginForm.get('password')?.setErrors({ wrongPassword_orEmail: true });
          } else {
            console.error('An error occurred:', error);
          }
        },
      });
    }
  }

}



