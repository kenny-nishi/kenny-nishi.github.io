import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserProfile } from '../interface';
import { StorageService } from '../storage.service';
import { Subscription } from 'rxjs';
import { FavourService } from '../favour.service'; // Import FavourService
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule], // Required imports
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  activeButton: string = 'search'; // Default active button
  isAuthenticated: boolean = false; // Authentication state
  userProfile: UserProfile | null = null; // User profile data
  private subscriptions: Subscription = new Subscription(); // To store subscriptions

  constructor(
    private router: Router,
    private authService: AuthService,
    private storage: StorageService,
    private favourite: FavourService // Inject FavourService
  ) {}

  ngOnInit(): void {
    // Restore the active button state on page load
    const savedActiveButton = this.storage.getItem<string>('activeButton');
    if (savedActiveButton) {
      this.activeButton = savedActiveButton; // Use the stored active button
    }

    // Subscribe to route changes and update activeButton
    this.subscriptions.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          const urlSegments = event.urlAfterRedirects.split('/');
          const currentTab = urlSegments[1] || 'search';
          this.activeButton = currentTab; // Update the activeButton locally
          this.storage.setItem('activeButton', currentTab); // Save it to localStorage
        }
      })
    );

    // Subscribe to authentication status changes
    this.subscriptions.add(
      this.authService.isAuthenticated$.subscribe(
        (authStatus) => (this.isAuthenticated = authStatus)
      )
    );

    // Subscribe to user profile changes
    this.subscriptions.add(
      this.authService.userProfile$.subscribe(
        (profile) => (this.userProfile = profile)
      )
    );
  }

  logout(): void {
    this.authService.logout(); // Perform logout
    this.router.navigate(['/login']); // Navigate to the login page
    this.storage.clear(); // Clear local storage
    this.favourite.clear(); // Clear favorite artists from local storage
  }

  deleteAccount(): void {
    this.authService.deleteAccount(); // Delete the account
    this.router.navigate(['/login']); // Navigate to the login page
    this.storage.clear(); // Clear local storage
    this.favourite.clear(); // Clear favorite artists from local storage
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.unsubscribe();
  }
}
