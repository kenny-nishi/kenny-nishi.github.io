export interface UserProfile{
  _id: string;
  fullname: string;
  email: string;
  profileImageUrl: string;
}

export interface Notification {
  id: string; // Unique identifier
  message: string; // Notification text
  type: 'success' | 'danger'; // Bootstrap styling
}
