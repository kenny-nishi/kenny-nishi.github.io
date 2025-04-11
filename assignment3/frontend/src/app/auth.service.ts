// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import { HttpClient } from '@angular/common/http';
// import { UserProfile } from './interface';
// import { response } from 'express';
// import { NotificationService } from './notification.service';
// @Injectable({
//   providedIn: 'root'
// })

// export class AuthService {
//   // Define global variables to track auth state and user profile
//   private isAuthenticated = new BehaviorSubject<boolean>(false);
//   private userProfile = new BehaviorSubject<UserProfile | null>(null);


//   // Expose these variables as observables for other components
//   isAuthenticated$ = this.isAuthenticated.asObservable();
//   userProfile$ = this.userProfile.asObservable();

//   constructor(private http: HttpClient,private notificationService: NotificationService) {}

//   // Method to check authentication (e.g., via /me endpoint)
//   checkAuthState(): void {
//     const backendurl = 'http://localhost:3000/me';
//     this.http.get<{user:UserProfile}>(backendurl, { withCredentials: true }).subscribe(
//       response => {
//         console.log('Auth state checked:', response);
//         this.updateUserProfile(response.user); // Update user profile if authenticated
//       },
//       (error) => {
//         console.error('Error checking auth state:', error);
//         this.isAuthenticated.next(false); // User is unauthenticated
//         this.userProfile.next(null);
//       }
//     );
//   }

//   updateUserProfile(user: UserProfile): void {
//       this.isAuthenticated.next(true); // User is authenticated
//       this.userProfile.next(user); // Store user profile
//   }
//   // Logout method to clear auth state
//   logout(): void {
//     const backendurl = 'http://localhost:3000/logout';
//     this.http.get(backendurl,{withCredentials: true}).subscribe(() => {
//       console.log('Logged out successfully');
//     });
//     this.isAuthenticated.next(false); // Reset auth state
//     this.userProfile.next(null);
//     this.notificationService.addNotification('Logged out', 'success');
//   }

//   deleteAccount(): void {
//     const backendurl = `http://localhost:3000/delete_user/${this.userProfile.value?._id}`;
//     this.http.delete(backendurl,{withCredentials: true}).subscribe(() => {
//       console.log('Account deleted successfully');
//     });
//     this.isAuthenticated.next(false); // Reset auth state
//     this.userProfile.next(null);
//     this.notificationService.addNotification('Account deleted', 'danger');
//   }
// }


import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserProfile } from './interface';
import { NotificationService } from './notification.service';
import { StorageService } from './storage.service';

// const backend = "https://csci571-assignment3-824257223293.us-west2.run.app"
const backend = "http://localhost:3000";


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Define BehaviorSubjects for auth state and user profile
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private userProfile = new BehaviorSubject<UserProfile | null>(null);

  // Expose observables for other components
  isAuthenticated$ = this.isAuthenticated.asObservable();
  userProfile$ = this.userProfile.asObservable();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private storage: StorageService
  ) {
    this.restoreAuthState(); // Restore auth state on initialization
  }

  // Method to restore authentication state from storage
  private restoreAuthState(): void {
    const storedAuth = this.storage.getItem<boolean>('isAuthenticated');
    const storedProfile = this.storage.getItem<UserProfile>('userProfile');

    if (storedAuth) {
      this.isAuthenticated.next(storedAuth);
    }

    if (storedProfile) {
      this.userProfile.next(storedProfile);
    }
  }

  // Method to check authentication status (e.g., via /me endpoint)
  checkAuthState(): void {
    // const backendurl = 'http://localhost:3000/me';
    const backendurl = `${backend}/me`;
    this.http.get<{ user: UserProfile }>(backendurl, { withCredentials: true }).subscribe(
      (response) => {
        console.log('Auth state checked:', response);
        this.updateUserProfile(response.user); // Update user profile if authenticated
      },
      (error) => {
        console.error('Error checking auth state:', error);
        this.clearAuthState(); // Clear auth state on error
      }
    );
  }

  // Update the auth state and persist it in storage
  updateUserProfile(user: UserProfile): void {
    this.isAuthenticated.next(true); // User is authenticated
    this.userProfile.next(user); // Store user profile
    this.storage.setItem('isAuthenticated', true); // Persist auth state
    this.storage.setItem('userProfile', user); // Persist user profile
  }

  // Clear authentication state (e.g., on logout or error)
  clearAuthState(): void {
    this.isAuthenticated.next(false); // Reset auth state
    this.userProfile.next(null); // Clear user profile
    this.storage.removeItem('isAuthenticated'); // Remove from storage
    this.storage.removeItem('userProfile'); // Remove from storage
  }

  // Logout method to clear auth state and notify
  logout(): void {
    // const backendurl = 'http://localhost:3000/logout';
    const backendurl = `${backend}/logout`;
    this.http.get(backendurl, { withCredentials: true }).subscribe(() => {
      console.log('Logged out successfully');
    });
    this.clearAuthState();
    this.notificationService.addNotification('Logged out', 'success');
  }

  // Delete account method to clear auth state and notify
  deleteAccount(): void {
    // const backendurl = `http://localhost:3000/delete_user/${this.userProfile.value?._id}`;
    const backendurl = `${backend}/delete_user/${this.userProfile.value?._id}`;
    this.http.delete(backendurl, { withCredentials: true }).subscribe(() => {
      console.log('Account deleted successfully');
    });
    this.clearAuthState();
    this.notificationService.addNotification('Account deleted', 'danger');
  }

  // Public method to access the authentication state
  public getIsAuthenticated(): boolean {
    return this.isAuthenticated.getValue(); // Extract the current value as boolean
  }
}
