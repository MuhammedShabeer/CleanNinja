import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServiceApiService, GalleryImage } from '../../services/service-api.service';

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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
