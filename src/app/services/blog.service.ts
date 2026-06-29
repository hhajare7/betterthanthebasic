import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  genre: string;
  imageUrl: string;
  publishedDate: string;
  readTime: string;
  author: string;
  keywords: string[];
  affiliateDisclosure: string;
  featured: boolean;
  amazonLink?: string;
  bgColor?: string;
  bgGradient?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private blogs: BlogPost[] = [];
  private platformId = inject(PLATFORM_ID);

  constructor() {}

  async loadBlogs(): Promise<void> {
    try {
      let dataText = '';
      if (isPlatformServer(this.platformId)) {
        const fs = await import('fs');
        const path = await import('path');
        const possiblePaths = [
          path.join(process.cwd(), 'public', 'blogs.json'),
          path.join(process.cwd(), 'dist', 'betterthanthebasic', 'browser', 'blogs.json'),
          path.join(process.cwd(), 'browser', 'blogs.json'),
        ];
        
        let fileContent = '';
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            fileContent = fs.readFileSync(p, 'utf8');
            break;
          }
        }
        if (!fileContent) {
          throw new Error('blogs.json not found in any of the expected paths: ' + possiblePaths.join(', '));
        }
        dataText = fileContent;
      } else {
        const response = await fetch('/blogs.json');
        dataText = await response.text();
      }
      this.blogs = JSON.parse(dataText);
    } catch (e) {
      console.error('Failed to load blogs.json:', e);
    }
  }

  getBlogs(): BlogPost[] {
    return this.blogs;
  }

  getFeaturedBlogs(): BlogPost[] {
    return this.blogs.filter(b => b.featured);
  }

  getRecentBlogs(limit: number = 3): BlogPost[] {
    // Already in reverse chronological order
    return this.blogs.slice(0, limit);
  }

  getBlogBySlug(slug: string): BlogPost | undefined {
    return this.blogs.find(b => b.slug === slug);
  }

  getBlogsByGenre(genre: string): BlogPost[] {
    return this.blogs.filter(b => b.genre.toLowerCase() === genre.toLowerCase());
  }

  getGenres(): string[] {
    return Array.from(new Set(this.blogs.map(b => b.genre)));
  }

  searchBlogs(query: string): BlogPost[] {
    if (!query || query.trim() === '') {
      return this.blogs;
    }
    const q = query.toLowerCase().trim();
    return this.blogs.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.description.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q) ||
      b.keywords.some(k => k.toLowerCase().includes(q))
    );
  }
}
