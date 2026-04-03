import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ContentService, SiteContent } from '../../../services/content.service';

@Component({
  selector: 'app-admin-content',
  templateUrl: './content.html',
  standalone: false
})
export class AdminContent implements OnInit {
  public contentItems: SiteContent[] = [];

  constructor(
    private contentService: ContentService,
    private cdr: ChangeDetectorRef
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
}
