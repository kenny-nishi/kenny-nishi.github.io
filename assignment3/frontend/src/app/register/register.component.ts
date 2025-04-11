import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {AuthService} from '../auth.service';
import { Router } from '@angular/router';


// const backend = "https://csci571-assignment3-824257223293.us-west2.run.app"
const backend = "http://localhost:3000";
@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  RegisterForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient,private authService: AuthService, private router: Router) {
    this.RegisterForm = this.fb.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.RegisterForm.valid) {
      // console.log(this.RegisterForm.value);
      // send to express backend server
      // const backendUrl = 'http://localhost:3000/register';
      const backendUrl = `${backend}/register`;
      this.http.post<{user:any}>(backendUrl, this.RegisterForm.value, { withCredentials: true }).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.authService.updateUserProfile(response.user); // Update user profile on successful registration
          this.router.navigate(['/search']);
        },
        error: (error) => {
          // handle the email already exists error here
          if (error.status === 400 && error.error.error === 'Email already exists') {
            this.RegisterForm.get('email')?.setErrors({ emailExists: true });
          } else {
            console.error('An error occurred:', error);
          }

        },
      });
    }
  }
}
