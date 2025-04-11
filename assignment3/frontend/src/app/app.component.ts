import { Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { AuthService } from './auth.service';
import { NotificationsComponent } from './notification/notification.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, NotificationsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}
  ngOnInit() {
    this.authService.checkAuthState(); //check tokens
  }
  title = 'frontend';
}


