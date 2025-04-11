import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../notification.service';
import { Notification } from '../interface';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})

export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Subscribe to notifications
    this.notificationService.getNotifications().subscribe((data) => {
      this.notifications = data;
    });
  }

  remove(id: string): void {
    this.notificationService.removeNotification(id);
  }
}
