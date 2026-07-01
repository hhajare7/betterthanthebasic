import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  name = signal('');
  email = signal('');
  subject = signal('');
  message = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private seoService: SeoService,
    private http: HttpClient
  ) {}

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
    const nameVal = this.name().trim();
    const emailVal = this.email().trim();
    const subjectVal = this.subject().trim();
    const messageVal = this.message().trim();

    if (!nameVal || !emailVal || !subjectVal || !messageVal) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const payload = {
      name: nameVal,
      email: emailVal,
      subject: subjectVal,
      message: messageVal
    };

    this.http.post<{ success?: boolean; message?: string; error?: string }>('/api/contact', payload)
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.success) {
            this.submitted.set(true);
            this.name.set('');
            this.email.set('');
            this.subject.set('');
            this.message.set('');
          } else {
            this.errorMessage.set(response.error || 'Failed to submit message. Please try again.');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.error || 'Failed to submit message. Please try again later.');
        }
      });
  }

  resetForm(): void {
    this.submitted.set(false);
    this.errorMessage.set('');
  }
}
