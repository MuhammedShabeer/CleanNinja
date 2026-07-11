import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.html',
  styleUrls: ['./blog-detail.css'],
  standalone: false
})
export class BlogDetail implements OnInit {
  blog: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private seoService: SeoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`/api/blogs/${id}`).subscribe({
        next: (res) => {
          this.blog = res;
          
          // Generate clean description snippet by stripping HTML tags
          const cleanDesc = this.blog.content
            ? this.blog.content.replace(/<[^>]*>/g, '').substring(0, 155) + '...'
            : 'Clean Ninja provides premium mobile car valeting and home deep cleaning.';
            
          this.seoService.updateSeoTags(`${this.blog.title} | Clean Ninja`, cleanDesc);
          
          // Generate and inject JSON-LD schema
          const schema = this.seoService.getBlogPostingSchema(this.blog);
          this.seoService.setJsonLd(schema);
          
          this.cdr.detectChanges();
        },
        error: () => {
          this.router.navigate(['/blogs']);
        }
      });
    }
  }
}
