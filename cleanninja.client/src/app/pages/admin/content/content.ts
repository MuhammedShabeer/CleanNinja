import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ContentService, SiteContent } from '../../../services/content.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-content',
  templateUrl: './content.html',
  standalone: false
})
export class AdminContent implements OnInit {
  public contentItems: SiteContent[] = [];

  constructor(
    private contentService: ContentService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.contentService.refreshContent().subscribe((items: SiteContent[] | null) => {
      if (items) {
        const excludedKeys = ['Services', 'SilverPackagePrice', 'SilverPackageFeatures', 'GoldPackagePrice', 'GoldPackageFeatures'];
        this.contentItems = JSON.parse(JSON.stringify(items)).filter((item: any) => !excludedKeys.includes(item.key));
      } else {
        this.contentItems = [];
      }
      this.cdr.detectChanges();
    });
  }

  saveContentItem(item: SiteContent): void {
    this.contentService.updateContentItem(item).subscribe(() => {
      alert(`Updated ${item.key} successfully.`);
    });
  }

  onFlyerSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      this.http.post<{ url: string }>('/api/content/upload-flyer', formData).subscribe({
        next: (res) => {
          alert('Flyer uploaded and activated successfully!');
          // Refresh content to show updated URL and status
          this.contentService.refreshContent().subscribe((items: SiteContent[] | null) => {
             if (items) {
               const excludedKeys = ['Services', 'SilverPackagePrice', 'SilverPackageFeatures', 'GoldPackagePrice', 'GoldPackageFeatures'];
               this.contentItems = JSON.parse(JSON.stringify(items)).filter((item: any) => !excludedKeys.includes(item.key));
             }
             this.cdr.detectChanges();
          });
        },
        error: () => alert('Failed to upload flyer.')
      });
    }
  }
}
