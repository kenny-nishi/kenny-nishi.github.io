import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification } from './interface';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  // Access notifications as an observable
  getNotifications() {
    return this.notifications.asObservable();
  }
  // Add a new notification
  addNotification(message: string, type: 'success' | 'danger'): void {
    const id = Date.now().toString(); // Unique ID for tracking
    const newNotification: Notification = { id, message, type };

    // Push the new notification to the stack
    const currentNotifications = this.notifications.getValue();
    this.notifications.next([...currentNotifications, newNotification]);

    console.log('Notification added:', newNotification);

    // Auto-remove after 3 seconds
    setTimeout(() => this.removeNotification(id), 3000);
  }

  // Remove a notification
  removeNotification(id: string): void {
    const currentNotifications = this.notifications.getValue();
    this.notifications.next(currentNotifications.filter(n => n.id !== id));
  }
  // constructor() { }
}


