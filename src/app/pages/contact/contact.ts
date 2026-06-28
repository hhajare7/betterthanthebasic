import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../services/seo.service';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, TextareaModule, ButtonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class ContactComponent implements OnInit {
  submitted = signal(false);

  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.setMeta(
      'Contact Us - Better Than The Basic',
      'Get in touch with the editors, research specialists, and compliance team at Better Than The Basic. Send us suggestions or inquiries.',
      ['contact us', 'betterthanthebasic email', 'editorial feedback', 'partnership proposals'],
      'https://betterthanthebasic.com/contact'
    );
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
  }

  resetForm(): void {
    this.submitted.set(false);
  }
}
