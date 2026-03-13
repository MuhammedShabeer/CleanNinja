import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface SiteContent {
  id?: number;
  section: string;
  key: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl = '/api/content';
  private contentCache = new BehaviorSubject<SiteContent[]>([]);

  constructor(private http: HttpClient) { }

  public loadInitialContent(): Observable<SiteContent[]> {
      return this.http.get<SiteContent[]>(this.apiUrl).pipe(
          tap(content => this.contentCache.next(content)),
          catchError(err => throwError(() => err))
      );
  }

  public getContent(): Observable<SiteContent[]> {
      return this.contentCache.asObservable();
  }

  public refreshContent(): Observable<SiteContent[]> {
      return this.loadInitialContent();
  }

  public updateContentItem(item: SiteContent): Observable<any> {
      return this.http.put(`${this.apiUrl}/${item.id}`, item).pipe(
          tap(() => this.refreshContent().subscribe())
      );
  }

  public getValue(key: string, defaultValue: string = ''): string {
      const item = this.contentCache.value.find(c => c.key === key);
      return item ? item.value : defaultValue;
  }

  public getParsedValue<T>(key: string, defaultValue: T): T {
    const val = this.getValue(key);
    if (!val) return defaultValue;
    try {
        return JSON.parse(val) as T;
    } catch {
        return defaultValue;
    }
  }
}
