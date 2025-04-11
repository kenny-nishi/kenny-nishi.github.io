export interface Artist {
  id: string;
  name: string;
  image: string;
}

export interface ArtistInfo {
  id: string;
  name: string;
  image: string;
  nationality: string;
  birthday: string;
  deathday: string;
  biography: string;
}

export interface Favorite extends ArtistInfo {
  addedAt: Date; // Extend ArtistInfo with additional property
}


export interface Artwork {
  id: string;
  title: string;
  date: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}
