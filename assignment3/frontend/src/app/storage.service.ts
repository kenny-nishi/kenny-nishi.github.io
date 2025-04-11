import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})

export class StorageService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  getItem<T>(key: string): T | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        console.error(`Failed to get item '${key}' from local storage:`, e);
        return null;
      }
    }
    return null; // Return null if not running in the browser
  }

  setItem<T>(key: string, value: T): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error(`Failed to set item '${key}' to local storage:`, e);
      }
    }
  }

  removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`Failed to remove item '${key}' from local storage:`, e);
      }
    }
  }

  clear(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.clear();
      } catch (e) {
        console.error('Failed to clear local storage:', e);
      }
    }
  }
}



// export class StorageService {
//   constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

//   // For navbar update
//   private activeButtonSource = new BehaviorSubject<string>('search');
//   activeButton$ = this.activeButtonSource.asObservable();

//   setActiveButton(button: string): void {
//     if (isPlatformBrowser(this.platformId)) {
//       try {
//         this.activeButtonSource.next(button);
//         localStorage.setItem('activeButton', button); // Persist only in browser
//       } catch (e) {
//         console.error('Failed to save active button to local storage:', e);
//       }
//     }
//   }

//   restoreActiveButton(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       try {
//         const savedButton = localStorage.getItem('activeButton') || 'search'; // Fallback to 'search'
//         this.activeButtonSource.next(savedButton);
//       } catch (e) {
//         console.error('Failed to restore active button from local storage:', e);
//         this.activeButtonSource.next('search'); // Default fallback
//       }
//     }
//   }

//   // For search page elements
//   private selectedCardId = new BehaviorSubject<string | null>(null);
//   selectedCardId$ = this.selectedCardId.asObservable();

//   setSelectedCardId(cardId: string): void {
//     if (isPlatformBrowser(this.platformId)) {
//       try {
//         this.selectedCardId.next(cardId);
//         localStorage.setItem('selectedCardId', cardId);
//       } catch (e) {
//         console.error('Failed to save selected card ID to local storage:', e);
//       }
//     }
//   }

//   restoreSelectedCardId(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       try {
//         const savedCardId = localStorage.getItem('selectedCardId');
//         if (savedCardId) {
//           this.selectedCardId.next(savedCardId);
//         }
//       } catch (e) {
//         console.error('Failed to restore selected card ID from local storage:', e);
//       }
//     }
//   }

//   private artistInfo = new BehaviorSubject<ArtistInfo | null>(null);
//   artistInfo$ = this.artistInfo.asObservable();

//   setArtistInfo(artist: ArtistInfo | null): void {
//     if (isPlatformBrowser(this.platformId)) {
//       try {
//         this.artistInfo.next(artist);
//         localStorage.setItem('artistInfo', JSON.stringify(artist));
//       } catch (e) {
//         console.error('Failed to save artist info to local storage:', e);
//       }
//     }
//   }

//   restoreArtistInfo(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       try {
//         const savedArtistInfo = localStorage.getItem('artistInfo');
//         if (savedArtistInfo) {
//           this.artistInfo.next(JSON.parse(savedArtistInfo));
//         }
//       } catch (e) {
//         console.error('Failed to restore artist info from local storage:', e);
//       }
//     }
//   }

//   private similarArtists = new BehaviorSubject<Artist[]>([]);
//   similarArtists$ = this.similarArtists.asObservable();

//   setSimilarArtists(artists: Artist[]): void {
//     if (isPlatformBrowser(this.platformId)) {
//       try {
//         this.similarArtists.next(artists);
//         localStorage.setItem('similarArtists', JSON.stringify(artists));
//       } catch (e) {
//         console.error('Failed to save similar artists to local storage:', e);
//       }
//     }
//   }

//   restoreSimilarArtists(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       try {
//         const savedSimilarArtists = localStorage.getItem('similarArtists');
//         if (savedSimilarArtists) {
//           this.similarArtists.next(JSON.parse(savedSimilarArtists));
//         }
//       } catch (e) {
//         console.error('Failed to restore similar artists from local storage:', e);
//       }
//     }
//   }
// }
