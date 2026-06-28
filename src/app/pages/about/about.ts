import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class AboutComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.setMeta(
      'Our Philosophy - Better Than The Basic',
      'Learn why we review premium alternatives and how we conduct our research. Our commitment is transparency, quality, and high performance.',
      ['about us', 'betterthanthebasic philosophy', 'review standards', 'ftc guidelines compliance'],
      'https://betterthanthebasic.com/about'
    );
  }
}
