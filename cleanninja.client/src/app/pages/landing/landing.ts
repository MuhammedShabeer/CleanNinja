import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { ContentService } from '../../services/content.service';
import { ServiceApiService, CleanService, ServiceFeedback, GalleryImage } from '../../services/service-api.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
  standalone: false
})
export class Landing implements OnInit, OnDestroy {
  public tagline: string = '';
  public services: CleanService[] = [];
  public landingCategories: any[] = [];
  public gallery: GalleryImage[] = [];
  public instagramHandle: string = '';
  public backendUrl: string = ''; // Relative paths for media resolution
  public isMobileMenuOpen: boolean = false;

  // Carousel State
  public testimonials: ServiceFeedback[] = [];
  public currentSlide: number = 0;
  private autoSlideInterval: any;
  // Feedback form state
  public openFeedbackForms: { [id: number]: boolean } = {};
  public feedbackDrafts: { [id: number]: { customerName: string; rating: number; comment: string } } = {};
  public feedbackSuccess: { [id: number]: boolean } = {};
  
  public offerServices: CleanService[] = [];

  constructor(
      private seoService: SeoService,
      private contentService: ContentService,
      private serviceApi: ServiceApiService,
      private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
      this.contentService.loadInitialContent().subscribe(() => {
          this.tagline = this.contentService.getValue('Tagline', 'In a mission to keep our red land clean.');
          this.instagramHandle = this.contentService.getValue('InstagramHandle', '@clean_ninja_official');
          const schema = this.seoService.getLocalBusinessSchema({ WhatsAppContact: this.contentService.getValue('WhatsAppContact') });
          this.seoService.setJsonLd(schema);
      });
      this.serviceApi.getGallery().subscribe(g => {
          this.gallery = g;
          this.cdr.detectChanges();
      });
      this.serviceApi.getServices().subscribe(s => {
          this.services = s.filter(svc => svc.name !== 'Bin Cleaning');
          this.offerServices = this.services.filter(svc => svc.showInOffersPopup);

          // Extract categories for the landing page grid
          const cats = new Set(this.services.map(svc => svc.category).filter(c => !!c && c !== 'Uncategorized'));
          this.landingCategories = Array.from(cats).map(catName => {
              const catServices = this.services.filter(svc => svc.category === catName);
              const firstWithMedia = catServices.find(svc => svc.media && svc.media.length > 0);
              return {
                  name: catName,
                  mediaUrl: firstWithMedia?.media[0]?.url,
                  icon: catServices[0]?.icon || '✨',
                  serviceCount: catServices.length
              };
          });
          
          // Add uncategorized services as their own standalone cards in the category grid if desired,
          // or just map them to a "General" category. Actually, let's include 'Uncategorized' services as their own categories.
          this.services.filter(svc => svc.category === 'Uncategorized').forEach(svc => {
              this.landingCategories.push({
                  name: svc.name,
                  mediaUrl: svc.media && svc.media.length > 0 ? svc.media[0].url : undefined,
                  icon: svc.icon || '✨',
                  serviceCount: 1,
                  isStandalone: true,
                  serviceId: svc.id
              });
          });
          
          this.testimonials = []; // Clear and aggregate
          s.forEach(svc => {
              this.feedbackDrafts[svc.id] = { customerName: '', rating: 5, comment: '' };
              this.openFeedbackForms[svc.id] = false;
              this.feedbackSuccess[svc.id] = false;

              // Aggregate approved feedbacks for the main carousel
              if (svc.feedbacks) {
                this.testimonials.push(...svc.feedbacks.filter(f => f.isApproved));
              }
          });

          // Add default testimonials if none exist yet
          if (this.testimonials.length === 0) {
            this.testimonials = [
              { id: 0, serviceId: 0, customerName: 'John Doe', rating: 5, comment: 'Best valeting service in Liverpool. They are on time, professional and the results are amazing. Highly recommended!', isApproved: true, createdAt: '' },
              { id: 0, serviceId: 0, customerName: 'Sarah Smith', rating: 5, comment: 'My car looks brand new! The interior detailing is second to none. Ninja speed and quality!', isApproved: true, createdAt: '' },
              { id: 0, serviceId: 0, customerName: 'Mike Wilson', rating: 5, comment: 'Great value for money. The mobile service is so convenient. Five stars!', isApproved: true, createdAt: '' }
            ];
          }

          this.startAutoSlide();
          this.cdr.detectChanges();


      });
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  private startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  public nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.testimonials.length;
  }

  public prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.testimonials.length) % this.testimonials.length;
  }

  public setSlide(index: number): void {
    this.currentSlide = index;
    // Reset interval if user interacts
    clearInterval(this.autoSlideInterval);
    this.startAutoSlide();
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

  getMediaUrl(url: string | undefined): string {
      if (!url) return 'assets/images/service_placeholder.png';
      if (url.startsWith('http')) return url;
      return `${this.backendUrl}${url}`;
  }

  // Mobile Menu Logic
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}
