import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceMedia {
  id: number;
  serviceId: number;
  fileName: string;
  fileType: string; // 'image' | 'video'
  url: string;
}

export interface ServiceFeedback {
  id: number;
  serviceId: number;
  customerName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface CleanService {
  id: number;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  isHighlighted: boolean;
  sortOrder: number;
  price?: number;
  discountedPrice?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  createdAt: string;
  media: ServiceMedia[];
  feedbacks: ServiceFeedback[];
}

@Injectable({ providedIn: 'root' })
export class ServiceApiService {
  constructor(private http: HttpClient) {}

  getServices(): Observable<CleanService[]> {
    return this.http.get<CleanService[]>('/api/services');
  }

  createService(s: Partial<CleanService>): Observable<CleanService> {
    return this.http.post<CleanService>('/api/services', s);
  }

  updateService(id: number, s: Partial<CleanService>): Observable<void> {
    return this.http.put<void>(`/api/services/${id}`, s);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`/api/services/${id}`);
  }

  uploadMedia(serviceId: number, file: File): Observable<ServiceMedia> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ServiceMedia>(`/api/services/${serviceId}/media`, formData);
  }

  deleteMedia(serviceId: number, mediaId: number): Observable<void> {
    return this.http.delete<void>(`/api/services/${serviceId}/media/${mediaId}`);
  }

  // Feedback
  getFeedback(serviceId: number): Observable<ServiceFeedback[]> {
    return this.http.get<ServiceFeedback[]>(`/api/feedback/${serviceId}/all`);
  }

  submitFeedback(fb: Partial<ServiceFeedback>): Observable<any> {
    return this.http.post('/api/feedback', fb);
  }

  approveFeedback(id: number): Observable<void> {
    return this.http.put<void>(`/api/feedback/${id}/approve`, {});
  }

  deleteFeedback(id: number): Observable<void> {
    return this.http.delete<void>(`/api/feedback/${id}`);
  }
}
