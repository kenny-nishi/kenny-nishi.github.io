import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {ArtistInfo, Favorite} from './search-page/artist_card'; // Adjust the import path as necessary
import {NotificationService} from './notification.service';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';

// const backend = "https://csci571-assignment3-824257223293.us-west2.run.app";
const backend = "http://localhost:3000";

@Injectable({
  providedIn: 'root',
})

export class FavourService{
  private favoriteArtists = new BehaviorSubject<Favorite[]>([]); // Array of artist IDs
  favoriteArtists$ = this.favoriteArtists.asObservable(); // Observable for reactive changes

  constructor(private notification:NotificationService, private http:HttpClient, private storageService: StorageService) { }

  restoreState(): void {
    const storedFavorites = this.storageService.getItem<Favorite[]>('favoriteArtists');
    if (storedFavorites) {
      this.favoriteArtists.next(storedFavorites);
    }else{
      this.favoriteArtists.next([]); // Initialize with an empty array if no favorites are found
      this.loadFavorites(); // Call loadFavorites directly
    }
  }

  loadFavorites(): void {
    // const backendurl = 'http://localhost:3000/favorites';
    const backendurl = `${backend}/favorites`;

    this.http.get<Favorite[]>(backendurl, { withCredentials: true }).subscribe(
      (response) => {
        // Combine existing favorites with the new response
        const updatedFavorites = [...this.favoriteArtists.getValue(), ...response];

        // Update BehaviorSubject once with the complete list
        this.favoriteArtists.next(updatedFavorites);

        // Save the updated list to local storage
        this.storageService.setItem('favoriteArtists', updatedFavorites);
      },
      (error) => {
        console.error('Error fetching favorite artists:', error);
      }
    );
  }


  // Add artist to favorites
  addFavorites(id:string,image:string): void {
    //update the favoriteArtists list
    this.http.post<Favorite>(
      // `http://localhost:3000/add_favorites`,
      `${backend}/add_favorites`,
      { id: id, image: image },
      {withCredentials: true} ).subscribe(
      (response) => {
        const favorite: Favorite = {
          id: id,
          image: image,
          name: response.name,
          nationality: response.nationality, // Added nationality (from ArtistInfo)
          birthday: response.birthday,
          deathday: response.deathday,
          biography: response.biography,
          addedAt: new Date(response.addedAt) // Ensure `addedAt` is processed as a date
        }
        const currentFavorites = this.favoriteArtists.getValue(); // Get the current state
        const updatedFavorites = currentFavorites ? [...currentFavorites, favorite] : [favorite];
        this.storageService.setItem('favoriteArtists', updatedFavorites); // Save to local storage
        this.favoriteArtists.next(updatedFavorites); // Push the updated list to BehaviorSubject
        //add notification
        this.notification.addNotification('Added to favorites', 'success');
      },
      (error) => {
        console.error('Error fetching artist data:', error);
      }
    );
  }

  // Remove artist from favorites
  removeFavorites(artistId:string): void {
    //update the favoriteArtists list
    const currentFavorites = this.favoriteArtists.getValue();
    const updatedFavorites = currentFavorites?.filter(fav => fav.id !== artistId) || [];
    this.favoriteArtists.next(updatedFavorites); // Push the updated list to BehaviorSubject
    const backendurl = `${backend}/delete_favorites/${artistId}`;
    this.http.delete(backendurl , {withCredentials: true}).subscribe({
      next: () => {
        console.log('Favorite removed successfully from backend');
      },
      error: (err) => {
        console.error('Failed to remove favorite from backend:', err);
      }
    });
    //add notification
    this.notification.addNotification('Removed from favorites', 'danger');
    this.storageService.setItem('favoriteArtists', updatedFavorites); // Save to local storage
  }

  // Check if artist is a favorite
  isFavorite(artistId: string): boolean {
    const currentFavorites = this.favoriteArtists.getValue(); // Get the current list of favorites
    return currentFavorites ? currentFavorites.some(fav => fav.id === artistId) : false;
  }
  clear(): void {
    console.log('Clearing all favorite data...');
    // Clear all local storage data
    this.storageService.clear();
    // Reset the in-memory favorite artists list
    this.favoriteArtists.next([]);
  }

}
