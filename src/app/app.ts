import { Component, signal, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  // Signal for mobile menu toggle
  mobileMenuOpen = signal(false);
  // Signal for global FTC banner visibility
  bannerHidden = signal(false);
  // Signal for theme mode (default to true/dark)
  isDarkMode = signal(true);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') {
        this.isDarkMode.set(false);
        this.applyTheme(false);
      } else {
        this.isDarkMode.set(true);
        this.applyTheme(true);
      }
    }
  }

  ngOnInit(): void {
    // Smoothly hide the banner after 3 seconds
    setTimeout(() => {
      this.bannerHidden.set(true);
    }, 3000);
  }

  toggleTheme(): void {
    const nextDark = !this.isDarkMode();
    this.isDarkMode.set(nextDark);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', nextDark ? 'dark' : 'light');
      this.applyTheme(nextDark);
    }
  }

  private applyTheme(dark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      const root = document.documentElement;
      if (dark) {
        root.classList.remove('light-theme');
      } else {
        root.classList.add('light-theme');
      }
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(val => !val);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
