import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { ContentService } from '../../services/content.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
  standalone: false
})
export class Landing implements OnInit {
  public tagline: string = '';
  public services: string[] = [];
  public instagramHandle: string = '';

  constructor(
      private seoService: SeoService,
      private contentService: ContentService
  ) {}

  ngOnInit(): void {
      this.contentService.loadInitialContent().subscribe(() => {
          this.tagline = this.contentService.getValue('Tagline', 'In a mission to keep our red land clean.');
          this.services = this.contentService.getParsedValue<string[]>('Services', ['Car Wash', 'Bin Cleaning', 'Window Cleaning']);
          this.instagramHandle = this.contentService.getValue('InstagramHandle', '@clean_ninja_official');

          // Set SEO Schema
          const schema = this.seoService.getLocalBusinessSchema({ WhatsAppContact: this.contentService.getValue('WhatsAppContact') });
          this.seoService.setJsonLd(schema);
      });
  }
}
