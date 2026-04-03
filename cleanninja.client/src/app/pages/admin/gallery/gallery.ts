import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServiceApiService, GalleryImage } from '../../../services/service-api.service';

@Component({
  selector: 'app-admin-gallery',
  templateUrl: './gallery.html',
  standalone: false
})
export class AdminGallery implements OnInit {
  public galleryImages: GalleryImage[] = [];
  public isUploadingGallery: boolean = false;

  constructor(
    private serviceApi: ServiceApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchGallery();
  }

  fetchGallery(): void {
    this.serviceApi.getGallery().subscribe((data: GalleryImage[]) => {
      this.galleryImages = data;
      this.cdr.detectChanges();
    });
  }

  onGalleryFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUploadingGallery = true;
    this.serviceApi.uploadGalleryImage(file).subscribe({
      next: () => {
        this.isUploadingGallery = false;
        this.fetchGallery();
      },
      error: () => {
        this.isUploadingGallery = false;
        alert('Upload failed.');
      }
    });
    input.value = '';
  }

  deleteGalleryImage(id: number): void {
    if (!confirm('Delete this gallery image?')) return;
    this.serviceApi.deleteGalleryImage(id).subscribe(() => this.fetchGallery());
  }
}
