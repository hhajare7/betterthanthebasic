import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { SeoService } from '../../services/seo.service';

interface DropdownItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    InputTextModule, 
    TextareaModule, 
    ButtonModule,
    SelectModule,
    CheckboxModule
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  // Signal form fields
  title = signal('');
  slug = signal('');
  genre = signal('Skincare');
  imageUrl = signal('');
  description = signal('');
  content = signal('');
  author = signal('Hemant Hajare');
  keywordsInput = signal('');
  affiliateDisclosure = signal('This post contains affiliate links. If you purchase through these links, we earn a commission at no extra cost to you.');
  featured = signal(false);

  // Genres list for dropdown
  genresList: DropdownItem[] = [
    { label: 'Skincare', value: 'Skincare' },
    { label: 'Home & Office Decor', value: 'Home & Office Decor' },
    { label: 'Electronic Gadgets', value: 'Electronic Gadgets' },
    { label: 'Miscellaneous', value: 'Miscellaneous' }
  ];

  // Environment checks & feedback
  isLocalhost = signal(false);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  
  // Generated file download support
  generatedJsonString = signal('');
  downloadUrl = signal('');

  constructor(
    private seoService: SeoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.seoService.setMeta(
      'Admin Creator - Better Than The Basic',
      'Create and format a new high-performance blog post blueprint.',
      ['admin', 'blog creator', 'developer tools'],
      'https://betterthanthebasic.com/admin'
    );

    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
      this.isLocalhost.set(isLocal);
    }
  }

  // Auto-generate slug from title
  onTitleChange(val: string): void {
    this.title.set(val);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // remove special characters
      .replace(/\s+/g, '-')         // replace spaces with dashes
      .replace(/-+/g, '-');        // collapse multiple dashes
    this.slug.set(generated);
  }

  // Calculate read time based on content length (200 words per minute average)
  readTime = computed(() => {
    const text = this.content();
    if (!text) return '1 min read';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  });

  // Date formatter
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  }

  // Build the blog post object payload
  getBlogPostPayload() {
    const parsedKeywords = this.keywordsInput()
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    return {
      slug: this.slug(),
      title: this.title(),
      description: this.description(),
      genre: this.genre(),
      imageUrl: this.imageUrl() || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      publishedDate: this.formatDate(new Date()),
      readTime: this.readTime(),
      author: this.author(),
      keywords: parsedKeywords,
      affiliateDisclosure: this.affiliateDisclosure(),
      featured: this.featured(),
      content: this.content()
    };
  }

  // Submit handler
  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.errorMessage.set('');
    this.successMessage.set('');
    this.generatedJsonString.set('');
    
    if (!this.title() || !this.slug() || !this.content()) {
      this.errorMessage.set('Title, Slug, and Content are required fields.');
      return;
    }

    const payload = this.getBlogPostPayload();
    
    if (this.isLocalhost()) {
      // Local mode: save file to disk via Express API
      this.loading.set(true);
      try {
        const response = await fetch('/api/blogs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        
        if (response.ok && result.success) {
          this.successMessage.set('Awesome! The new blueprint has been saved directly to public/blogs.json.');
          this.resetForm();
        } else {
          this.errorMessage.set(result.error || 'Failed to save blog post to file.');
        }
      } catch (err: any) {
        this.errorMessage.set('Connection error: Make sure your local server is running and express route is working.');
      } finally {
        this.loading.set(false);
      }
    } else {
      // Deployed / Vercel mode: Generate download file
      this.loading.set(true);
      try {
        // Fetch current live blogs.json
        const response = await fetch('/blogs.json');
        let currentBlogs = [];
        if (response.ok) {
          currentBlogs = await response.json();
        }
        
        // Prepend new post
        const updatedBlogs = [payload, ...currentBlogs];
        const jsonStr = JSON.stringify(updatedBlogs, null, 2);
        
        this.generatedJsonString.set(jsonStr);
        
        // Create blob download link
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        this.downloadUrl.set(url);
        
        this.successMessage.set('Read-only deployment detected. Your updated blogs.json file is ready below!');
      } catch (err) {
        this.errorMessage.set('Could not fetch existing blogs.json from server.');
      } finally {
        this.loading.set(false);
      }
    }
  }

  resetForm(): void {
    this.title.set('');
    this.slug.set('');
    this.genre.set('Skincare');
    this.imageUrl.set('');
    this.description.set('');
    this.content.set('');
    this.keywordsInput.set('');
    this.featured.set(false);
  }
}
