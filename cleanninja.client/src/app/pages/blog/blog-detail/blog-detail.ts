import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`/api/blogs/${id}`).subscribe({
        next: (res) => {
          this.blog = res;
          this.cdr.detectChanges();
        },
        error: () => {
          this.router.navigate(['/blogs']);
        }
      });
    }
  }
}
