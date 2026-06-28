import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService, BlogPost } from '../../services/blog.service';
import { SeoService } from '../../services/seo.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './blogs.html',
  styleUrl: './blogs.css'
})
export class BlogsComponent implements OnInit {
  // Signals for local state management
  searchQuery = signal<string>('');
  selectedGenre = signal<string>('All');
  genres = signal<string[]>([]);

  // Computed state for filtered list
  filteredBlogs = computed<BlogPost[]>(() => {
    let blogsList = this.blogService.getBlogs();
    
    // 1. Filter by Genre
    if (this.selectedGenre() !== 'All') {
      blogsList = blogsList.filter(b => b.genre.toLowerCase() === this.selectedGenre().toLowerCase());
    }
    
    // 2. Filter by Search Query
    if (this.searchQuery().trim() !== '') {
      const q = this.searchQuery().toLowerCase().trim();
      blogsList = blogsList.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.description.toLowerCase().includes(q) ||
        b.keywords.some(k => k.toLowerCase().includes(q))
      );
    }
    
    return blogsList;
  });

  constructor(
    private blogService: BlogService,
    private seoService: SeoService,
    private route: ActivatedRoute
  ) {
    // Set up query param watcher
    this.route.queryParams.subscribe(params => {
      if (params['genre']) {
        this.selectedGenre.set(params['genre']);
      }
    });
  }

  ngOnInit(): void {
    // Set blogs SEO
    this.seoService.setMeta(
      'Our Blueprints & Guides - Premium Recommendations',
      'Browse through our detailed blueprints in clinical skincare, home & office decor, smart electronic gadgets, and curated daily essentials.',
      ['blog list', 'betterthanthebasic guides', 'skincare blueprints', 'decor recommendations', 'electronic gadgets'],
      'https://betterthanthebasic.com/blogs'
    );

    this.genres.set(this.blogService.getGenres());
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedGenre.set('All');
  }
}
