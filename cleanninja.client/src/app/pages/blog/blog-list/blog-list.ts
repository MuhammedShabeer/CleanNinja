import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.html',
  styleUrls: ['./blog-list.css'],
  standalone: false
})
export class BlogList implements OnInit {
  blogs: any[] = [];
  errorMsg: string = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.updateSeoTags(
        'Cleaning Tips & News in Liverpool - Clean Ninja',
        'Read the latest valeting tips, news, and updates from Clean Ninja in Liverpool.'
    );
    this.http.get<any[]>('/api/blogs').subscribe({
      next: (res) => {
        this.blogs = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err.message || JSON.stringify(err);
        console.error('Error fetching blogs:', err);
        this.cdr.detectChanges();
      }
    });
  }
}
