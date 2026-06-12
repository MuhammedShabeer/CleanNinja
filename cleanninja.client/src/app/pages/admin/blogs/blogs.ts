import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-blogs',
  templateUrl: './blogs.html',
  standalone: false
})
export class AdminBlogs implements OnInit {
  blogs: any[] = [];
  isModalOpen = false;
  isEditing = false;
  currentBlog: any = { title: '', content: '', imageUrl: '', author: 'Admin', isPublished: true };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchBlogs();
  }

  fetchBlogs(): void {
    this.http.get<any[]>('/api/blogs?admin=true').subscribe(res => {
      this.blogs = res;
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentBlog = { title: '', content: '', imageUrl: '', author: 'Admin', isPublished: true };
    this.isModalOpen = true;
  }

  openEditModal(blog: any): void {
    this.isEditing = true;
    this.currentBlog = { ...blog };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveBlog(): void {
    if (this.isEditing) {
      this.http.put(`/api/blogs/${this.currentBlog.id}`, this.currentBlog).subscribe(() => {
        this.fetchBlogs();
        this.closeModal();
      });
    } else {
      this.http.post('/api/blogs', this.currentBlog).subscribe(() => {
        this.fetchBlogs();
        this.closeModal();
      });
    }
  }

  deleteBlog(id: number): void {
    if (confirm('Are you sure you want to delete this blog post?')) {
      this.http.delete(`/api/blogs/${id}`).subscribe(() => {
        this.fetchBlogs();
      });
    }
  }
}
