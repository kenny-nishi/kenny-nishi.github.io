import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavourService } from '../favour.service';
import { Favorite } from '../search-page/artist_card';
import { RouterModule, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-favourite-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favourite-page.component.html',
  styleUrls: ['./favourite-page.component.scss'] // Fixed typo: `styleUrl` -> `styleUrls`
})
export class FavouritePageComponent implements OnInit, OnDestroy {
  favorites: Favorite[] = []; // Store favorite artists
  relativeTimeMap: { [id: string]: string } = {}; // Map to store relative times
  isLoading = true; // Show spinner during initial load
  timerSubscription!: Subscription; // Subscription for timer updates

  constructor(public favouriteService: FavourService, private router: Router) {}

  ngOnInit(): void {
    this.favouriteService.restoreState(); // Restore favorite artists from local storage
    // Load favorites and initialize relative times
    this.favouriteService.favoriteArtists$.subscribe((favorites) => {
      this.favorites = favorites;
      this.initializeTimers(); // Initialize timers for all favorites
      this.isLoading = false; // Hide spinner after load
    });

    // Update timers every second
    this.timerSubscription = interval(1000).subscribe(() => {
      this.updateTimers();
    });
  }

  // Initialize relative times for all favorites
  initializeTimers(): void {
    this.favorites.forEach((favorite) => {
      this.relativeTimeMap[favorite.id] = this.calculateRelativeTime(favorite.addedAt);
    });
  }

  // Update relative times for all favorites
  updateTimers(): void {
    this.favorites.forEach((favorite) => {
      this.relativeTimeMap[favorite.id] = this.calculateRelativeTime(favorite.addedAt);
    });
  }

  calculateRelativeTime(addedAt: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - new Date(addedAt).getTime()) / 1000);

    if (seconds <= 60) {
      return `${seconds} seconds ago`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hours ago`;
    }
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }

  removeFavorite(id: string): void {
    this.favouriteService.removeFavorites(id);
    delete this.relativeTimeMap[id]; // Remove timer entry for deleted favorite
  }

  navigateToDetails(id: string): void {
    //need to set the search page content
    this.router.navigate(['/search'], { state: { fromFavorites: true } });
  }

  ngOnDestroy(): void {
    // Clear timer subscription
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}

