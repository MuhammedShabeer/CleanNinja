import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServiceApiService, GalleryImage } from '../../services/service-api.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css'],
  standalone: false
})
export class GalleryPage implements OnInit {
  public gallery: GalleryImage[] = [];
  public backendUrl: string = '';

  constructor(
    private serviceApi: ServiceApiService,
    private cdr: ChangeDetectorRef,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.seoService.updateSeoTags(
        'Our Work - Valeting & Cleaning in Liverpool',
        'View the transformational results of our mobile valeting and cleaning services in Liverpool.'
    );
    this.serviceApi.getGallery().subscribe(g => {
      this.gallery = g;
      this.cdr.detectChanges();
    });
  }

  getMediaUrl(url: string | undefined): string {
    if (!url) return 'assets/images/service_placeholder.png';
    if (url.startsWith('http')) return url;
    return `${this.backendUrl}${url}`;
  }
}
