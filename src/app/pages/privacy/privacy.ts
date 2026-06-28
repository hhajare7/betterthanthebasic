import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './privacy.html',
  styleUrl: './privacy.css'
})
export class PrivacyComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.setMeta(
      'Privacy Policy - Better Than The Basic',
      'Read the privacy policy of Better Than The Basic. Understand how we handle newsletter subscriptions and cookies for affiliate link tracking.',
      ['privacy policy', 'cookie tracking disclosure', 'betterthanthebasic privacy rules'],
      'https://betterthanthebasic.com/privacy'
    );
  }
}
