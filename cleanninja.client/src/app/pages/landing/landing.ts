import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { ContentService } from '../../services/content.service';
import { ServiceApiService, CleanService, ServiceFeedback } from '../../services/service-api.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
  standalone: false
})
export class Landing implements OnInit {
  public tagline: string = '';
  public services: CleanService[] = [];
  public instagramHandle: string = '';

  // Feedback form state
  public openFeedbackForms: { [id: number]: boolean } = {};
  public feedbackDrafts: { [id: number]: { customerName: string; rating: number; comment: string } } = {};
  public feedbackSuccess: { [id: number]: boolean } = {};

  constructor(
      private seoService: SeoService,
      private contentService: ContentService,
      private serviceApi: ServiceApiService
  ) {}

  ngOnInit(): void {
      this.contentService.loadInitialContent().subscribe(() => {
          this.tagline = this.contentService.getValue('Tagline', 'In a mission to keep our red land clean.');
          this.instagramHandle = this.contentService.getValue('InstagramHandle', '@clean_ninja_official');
          const schema = this.seoService.getLocalBusinessSchema({ WhatsAppContact: this.contentService.getValue('WhatsAppContact') });
          this.seoService.setJsonLd(schema);
      });
      this.serviceApi.getServices().subscribe(s => {
          this.services = s;
          s.forEach(svc => {
              this.feedbackDrafts[svc.id] = { customerName: '', rating: 5, comment: '' };
              this.openFeedbackForms[svc.id] = false;
              this.feedbackSuccess[svc.id] = false;
          });
      });
  }

  toggleFeedbackForm(serviceId: number): void {
      this.openFeedbackForms[serviceId] = !this.openFeedbackForms[serviceId];
      this.feedbackSuccess[serviceId] = false;
  }

  submitFeedback(serviceId: number): void {
      const draft = this.feedbackDrafts[serviceId];
      if (!draft.customerName.trim() || !draft.comment.trim()) {
          alert('Please fill in your name and comment.'); return;
      }
      this.serviceApi.submitFeedback({ serviceId, ...draft }).subscribe({
          next: () => {
              this.feedbackSuccess[serviceId] = true;
              this.feedbackDrafts[serviceId] = { customerName: '', rating: 5, comment: '' };
          },
          error: () => alert('Failed to submit feedback. Please try again.')
      });
  }

  avgRating(feedbacks: ServiceFeedback[]): number {
      if (!feedbacks || feedbacks.length === 0) return 0;
      return Math.round(feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length);
  }
}
