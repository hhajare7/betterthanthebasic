import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-disclosure',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './disclosure.html',
  styleUrl: './disclosure.css'
})
export class DisclosureComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.setMeta(
      'Affiliate & FTC Disclosure - Better Than The Basic',
      'Transparency pledge and FTC compliance details. Learn how our affiliate model operates and how we protect our editorial integrity.',
      ['ftc affiliate disclosure', 'advertising endorsement rules', 'amazon associates disclosure', 'transparent blog reviews'],
      'https://betterthanthebasic.com/disclosure'
    );
  }
}
