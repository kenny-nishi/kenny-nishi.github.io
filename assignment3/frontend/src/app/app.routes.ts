import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SearchPageComponent } from './search-page/search-page.component';
import { FavouritePageComponent } from './favourite-page/favourite-page.component';
import { AuthGuard } from './auth.guard'; // Import your AuthGuard
export const routes: Routes = [
  {path: '', redirectTo: 'search', pathMatch: 'full'},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'search', component: SearchPageComponent },
  { path: 'favourite', component: FavouritePageComponent, canActivate: [AuthGuard] },
];
