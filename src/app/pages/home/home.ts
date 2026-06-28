import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService, BlogPost } from '../../services/blog.service';
import { SeoService } from '../../services/seo.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, InputTextModule, ButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  recentBlogs = signal<BlogPost[]>([]);
  genres = signal<string[]>([]);
  subscribed = signal(false);

  constructor(
    private blogService: BlogService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    // Set premium SEO meta tags
    this.seoService.setMeta(
      'BetterThanTheBasic - Premium Curated Product & Lifestyle Blueprints',
      'Discover high-performance blueprints in clinical skincare, aesthetic home & office decor, smart electronic gadgets, and curated daily essentials.',
      ['clinical skincare', 'eltamd sunscreen', 'desk setups', 'aesthetic decor', 'electronic gadgets', 'smart tech', 'curated essentials'],
      'https://betterthanthebasic.com/'
    );

    this.recentBlogs.set(this.blogService.getRecentBlogs(3));
    this.genres.set(this.blogService.getGenres());
  }

  getGenreDescription(genre: string): string {
    switch (genre.toLowerCase()) {
      case 'skincare':
        return 'Dermatologist-recommended routines, broad-spectrum sunscreens, and high-efficacy skincare blueprints.';
      case 'home & office decor':
        return 'Ergonomic workspaces, desk aesthetics, modern lighting, and premium home decor blueprints.';
      case 'electronic gadgets':
        return 'High-performance tech gear, custom mechanical keyboards, and smart productivity electronics.';
      case 'miscellaneous':
        return 'Curated lifestyle upgrades, travel essentials, behavioral design loops, and smart habits.';
      default:
        return 'Premium recommendations and detailed guides to upgrade your routine.';
    }
  }

  onSubscribe(event: Event): void {
    event.preventDefault();
    this.subscribed.set(true);
  }
}
