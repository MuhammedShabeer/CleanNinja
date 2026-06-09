import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServiceApiService, SystemFeedback } from '../../../services/service-api.service';

@Component({
  selector: 'app-admin-reviews',
  templateUrl: './reviews.html',
  standalone: false
})
export class AdminReviews implements OnInit {
  public feedbacks: SystemFeedback[] = [];
  public loading: boolean = true;

  constructor(
    private serviceApi: ServiceApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  loadFeedbacks(): void {
    this.loading = true;
    this.serviceApi.getAllFeedbackSystemWide().subscribe({
      next: (data: SystemFeedback[]) => {
        this.feedbacks = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load feedbacks', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  approveFeedback(id: number): void {
    if (confirm('Approve this review to show on the public site?')) {
      this.serviceApi.approveFeedback(id).subscribe(() => {
        this.loadFeedbacks();
      });
    }
  }

  deleteFeedback(id: number): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.serviceApi.deleteFeedback(id).subscribe(() => {
        this.loadFeedbacks();
      });
    }
  }
}
