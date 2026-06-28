import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService, BlogPost } from '../../services/blog.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.css'
})
export class BlogDetailComponent implements OnInit {
  post = signal<BlogPost | undefined>(undefined);
  loaded = signal(false);

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    // Read route param slug
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        const blogPost = this.blogService.getBlogBySlug(slug);
        this.post.set(blogPost);
        this.loaded.set(true);

        if (blogPost) {
          // Set dynamic SEO tags for Google crawler to scrape SSR HTML
          this.seoService.setMeta(
            blogPost.title,
            blogPost.description,
            blogPost.keywords,
            `https://betterthanthebasic.com/blogs/${blogPost.slug}`
          );
        } else {
          this.seoService.setMeta(
            'Blueprint Not Found',
            'We were unable to locate the requested product review or lifestyle guide.',
            ['not found', 'error'],
            'https://betterthanthebasic.com/404'
          );
        }
      }
    });
  }
}
