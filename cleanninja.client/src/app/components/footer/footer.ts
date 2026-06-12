import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceApiService } from '../../services/service-api.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
  standalone: false
})
export class FooterComponent implements OnInit {
  public blogs: any[] = [];
  public landingCategories: any[] = [];

  constructor(
    private http: HttpClient,
    private serviceApi: ServiceApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/blogs').subscribe(b => {
      this.blogs = b;
      this.cdr.detectChanges();
    });

    this.serviceApi.getServices().subscribe(s => {
      const cats = new Set(s.map(svc => svc.category).filter(c => c && c.trim() !== ''));
      this.landingCategories = Array.from(cats).map(catName => {
        return { name: catName, isStandalone: false };
      });

      const standalone = s.filter(svc => !svc.category || svc.category.trim() === '');
      standalone.forEach(svc => {
        this.landingCategories.push({
          name: svc.name,
          isStandalone: true,
          serviceId: svc.id
        });
      });
      this.cdr.detectChanges();
    });
  }

  getMediaUrl(url: string | undefined): string {
    if (!url) return 'assets/images/service_placeholder.png';
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? url : '/' + url;
  }
}
