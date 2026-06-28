import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { AboutComponent } from './pages/about/about';
import { BlogsComponent } from './pages/blogs/blogs';
import { BlogDetailComponent } from './pages/blog-detail/blog-detail';
import { ContactComponent } from './pages/contact/contact';
import { PrivacyComponent } from './pages/privacy/privacy';
import { DisclosureComponent } from './pages/disclosure/disclosure';
import { AdminComponent } from './pages/admin/admin';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'blogs/:slug', component: BlogDetailComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'disclosure', component: DisclosureComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
