import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  
  public offerServices: CleanService[] = [];

  constructor(
      private route: ActivatedRoute,
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
          this.offerServices = this.services.filter(svc => !!svc.offerFlyerUrl);

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

              // Aggregate approved feedbacks for the main carousel
              if (svc.feedbacks) {
                this.testimonials.push(...svc.feedbacks.filter(f => f.isApproved));
              }
          });

          this.startAutoSlide();
          
          this.route.queryParams.subscribe(params => {
              if (params['review'] === 'true') {
                  this.showGlobalFeedbackForm = true;
                  if (params['serviceId']) {
                      this.globalFeedbackDraft.serviceId = parseInt(params['serviceId'], 10);
                  }
              }
          });
          
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

  // Global Feedback Form
  public showGlobalFeedbackForm: boolean = false;
  public globalFeedbackDraft: { serviceId: number, customerName: string, rating: number, comment: string } = { serviceId: 0, customerName: '', rating: 5, comment: '' };
  public globalFeedbackSuccess: boolean = false;

  toggleGlobalFeedbackForm(): void {
      this.showGlobalFeedbackForm = !this.showGlobalFeedbackForm;
      this.globalFeedbackSuccess = false;
      if (this.services.length > 0 && this.globalFeedbackDraft.serviceId === 0) {
          this.globalFeedbackDraft.serviceId = this.services[0].id;
      }
  }

  submitGlobalFeedback(): void {
      if (this.globalFeedbackDraft.serviceId === 0) {
          alert('Please select a service.'); return;
      }
      if (!this.globalFeedbackDraft.customerName.trim() || !this.globalFeedbackDraft.comment.trim()) {
          alert('Please fill in your name and comment.'); return;
      }
      this.serviceApi.submitFeedback(this.globalFeedbackDraft).subscribe({
          next: () => {
              this.globalFeedbackSuccess = true;
              this.globalFeedbackDraft = { serviceId: 0, customerName: '', rating: 5, comment: '' };
              this.cdr.detectChanges();
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
