import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  setMeta(title: string, description: string, keywords: string[] = [], canonicalUrl?: string) {
    const fullTitle = `${title} | BetterThanTheBasic`;
    this.titleService.setTitle(fullTitle);

    // Standard Meta Tags
    this.metaService.updateTag({ name: 'description', content: description });
    
    if (keywords.length > 0) {
      this.metaService.updateTag({ name: 'keywords', content: keywords.join(', ') });
    } else {
      this.metaService.removeTag("name='keywords'");
    }

    // OpenGraph Meta Tags (for Social Media previews)
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:site_name', content: 'BetterThanTheBasic' });

    // Twitter Card Meta Tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: description });

    // Canonical link tag manipulation
    if (canonicalUrl) {
      let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");
      if (!link) {
        link = this.document.createElement('link');
        link.setAttribute('rel', 'canonical');
        this.document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }
  }
}
