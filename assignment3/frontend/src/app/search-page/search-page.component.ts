import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Artist, ArtistInfo, Artwork, Category } from './artist_card'; // Adjust the import path as necessary
import { AuthService } from '../auth.service';
import { StorageService } from '../storage.service';
import { FavourService } from '../favour.service';


// const backend = "https://csci571-assignment3-824257223293.us-west2.run.app"
const backend = "http://localhost:3000";


@Component({
  selector: 'app-search-page',
  imports: [CommonModule],
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
})
export class SearchPageComponent implements OnInit {
  isInputEmpty = true; // To track whether input is empty
  loading = false;
  artists: Artist[] = []; // To store the list of artists
  similarArtists: Artist[] = []; // To store the list of similar artists
  selectedCardId: string | null = null; // Variable to track which card is clicked
  selectedCardImage: string | null = null; // Variable to track which card image is clicked
  artistInfo: ArtistInfo | null = null; // To store the artist info
  Category: Category[] = []; // To store the category info
  artworks: Artwork[] = [];
  selectedArtwork: any = null; // Holds the currently selected artwork
  loadingArtistInfo: boolean = false;
  loadingArtworks: boolean = false;
  isAuthenticated: boolean = false; // To track authentication status
  showResults: boolean = false; // To control the visibility of results
  showDetails: boolean = false; // To control the visibility of details
  showArtworkTab: boolean = false; // To control the visibility of artworks tab

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private storage: StorageService,
    public favorite: FavourService
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication status
    this.authService.isAuthenticated$.subscribe(
      (authStatus) => (this.isAuthenticated = authStatus)
    );
    // Restore state from local storage using StorageService
    this.restoreState();
  }

  // To track whether input is empty
  validateSearchInput(value: string): void {
    this.isInputEmpty = value.trim() === ''; // If input is empty, disable the button
  }

  // To handle the clear button behavior
  clear(input: HTMLInputElement): void {
    input.value = ''; // Clear the input field
    this.isInputEmpty = true; // Mark input as empty
    this.showResults = false; // Hide results
    this.showDetails = false; // Hide details
    this.selectedCardId = null; // Clear selected card ID
    this.selectedCardImage = null; // Clear selected card image
    this.storage.setItem('selectedCardId', null); // Clear selected card ID
    this.storage.setItem('selectedCardImage', null); // Clear selected card image
    this.storage.setItem('showDetails', false); // Hide details
    this.storage.setItem('showArtworkTab', false); // Hide artworks tab
  }

  restoreState(): void {
    // Restore selected card ID
    const savedCardId = this.storage.getItem<string>('selectedCardId');
    if (savedCardId) this.selectedCardId = savedCardId;

    const savedCardImage = this.storage.getItem<string>('selectedCardImage');
    if (savedCardImage) this.selectedCardImage = savedCardImage; // Restore selected card image
    // Restore artist info
    const savedArtistInfo = this.storage.getItem<ArtistInfo>('artistInfo');
    if (savedArtistInfo) this.artistInfo = savedArtistInfo;

    // Restore similar artists
    const savedSimilarArtists = this.storage.getItem<Artist[]>('similarArtists');
    if (savedSimilarArtists) this.similarArtists = savedSimilarArtists;

    this.showResults = false; // after reload or first time in, should be not showing results

    const savedShowDetails = this.storage.getItem<boolean>('showDetails');
    if (savedShowDetails) this.showDetails = savedShowDetails;

    const savedShowArtworkTab = this.storage.getItem<boolean>('showArtworkTab');
    if (savedShowArtworkTab) this.showArtworkTab = savedShowArtworkTab;

    const savedArtworks = this.storage.getItem<Artwork[]>('artworks');
    if (savedArtworks) this.artworks = savedArtworks; // Restore artworks
  }

  onSubmit(event: Event, text: string): void {
    event.preventDefault(); // Prevent page refresh
    this.loading = true; // Start spinner

    // const backendUrl = 'http://localhost:3000/artist_search'; // Replace with your backend URL
    const backendUrl = `${backend}/artist_search`; // Replace with your backend URL
    this.http.get<{ status: string; output: Artist[] }>(`${backendUrl}/${text}`).subscribe(
      (response) => {
        this.artists = response.output; // Populate artists array
        for (const artist of this.artists) {
          if (artist.image === '/assets/shared/missing_image.png') {
            artist.image = '../../images/artsy_logo.svg';
          }
        }
        this.loading = false; // Stop spinner
        this.showResults = true; // Show results after loading
      },
      (error) => {
        console.error('Error:', error);
        this.loading = false; // Stop spinner in case of error
      }
    );
  }

  onCardClick(artist:Artist): void {
    this.selectedCardImage = artist.image; // Store selected card image
    this.selectedCardId = artist.id; // Store selected card ID
    this.storage.setItem('selectedCardId', artist.id); // Store selected card ID in local storage
    this.storage.setItem('selectedCardImage', artist.image); // Store selected card image in local storage
    if(this.showArtworkTab) this.loadArtworks(); // Load artworks if tab is open
    else this.loadArtistInfo(); // Load artist info and similar artists
    this.storage.setItem('showDetails',true) // Show details after loading
    this.showDetails = true; // Show details after loading
  }

  loadSimilarArtists(): void {
    // const backendUrl = 'http://localhost:3000/similar_artists';
    const backendUrl = `${backend}/similar_artists`; // Replace with your backend URL
    this.http.get<{ status: string; output: Artist[] }>(`${backendUrl}/${this.selectedCardId}`).subscribe(
      (response) => {
        this.similarArtists = response.output; // Update similar artists
        for (const artist of this.similarArtists) {
          if (artist.image === '/assets/shared/missing_image.png') {
            artist.image = '../../images/artsy_logo.svg';
          }
        }
        this.storage.setItem('similarArtists', this.similarArtists); // Store similar artists in local storage
      },
      (error) => {
        console.error('Failed to load similar artists:', error);
      }
    );
  }

  loadArtistInfo(): void {
    this.loadSimilarArtists(); // Load similar artists
    this.loadingArtistInfo = true; // Show spinner
    // const backendUrl = 'http://localhost:3000/artist_detail';
    const backendUrl = `${backend}/artist_detail`; // Replace with your backend URL
    this.http.get<{ status: string; output: ArtistInfo }>(`${backendUrl}/${this.selectedCardId}`).subscribe(
      (response) => {
        this.artistInfo = response.output; // Update artist info
        this.artistInfo.image = this.selectedCardImage!;
        this.storage.setItem('artistInfo', this.artistInfo); // Store artist info in local storage
        this.loadingArtistInfo = false; // Hide spinner
        this.showArtworkTab = false; // Hide artworks tab when artist info is loaded
        this.storage.setItem('showArtworkTab', false); // Hide artworks tab when artist info is loaded
      },
      (error) => {
        console.error('Failed to load artist info:', error);
        this.loadingArtistInfo = false;
      }
    );
  }

  loadArtworks(): void {
    this.loadingArtworks = true; // Show spinner
    // const backendUrl = 'http://localhost:3000/artwork';
    const backendUrl = `${backend}/artwork`; // Replace with your backend URL
    this.http.get<{ output: Artwork[] }>(`${backendUrl}/${this.selectedCardId}`).subscribe(
      (response) => {
        this.artworks = response.output; // Update artworks list
        this.loadingArtworks = false; // Hide spinner
        this.storage.setItem('artworks', this.artworks); // Store artworks in local storage
        this.showArtworkTab = true; // Show artworks tab after loading
        this.storage.setItem('showArtworkTab', true); // Show artworks tab after loading
      },
      (error) => {
        console.error('Failed to load artworks:', error);
        this.loadingArtworks = false;
      }
    );
  }

  viewCategory(artwork: Artwork): void {
    // const backendUrl = `http://localhost:3000/genes/${artwork.id}`;
    const backendUrl = `${backend}/genes/${artwork.id}`; // Replace with your backend URL
    this.selectedArtwork = artwork; // Store selected artwork
    this.http.get<{ output: Category[] }>(backendUrl).subscribe(
      (response) => {
        this.Category = response.output; // Update category info
      },
      (error) => {
        console.error('Error fetching category info:', error);
      }
    );
  }

  toggleFavorite(artistId: string, image:string): void {
    // Check if the artist is already a favorite
    const isFavorite = this.favorite.isFavorite(artistId);
    if (isFavorite) {
      this.favorite.removeFavorites(artistId); // Remove from favorites
    } else {
      this.favorite.addFavorites(artistId,image); // Add to favorites
    }
  }
}
