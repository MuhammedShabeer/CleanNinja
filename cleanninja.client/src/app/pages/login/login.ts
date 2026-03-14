import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: false
})
export class Login {
  public mode: 'login' | 'register' = 'login';
  public name: string = '';
  public email: string = '';
  public password: string = '';
  public errorMessage: string = '';
  public isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin']);
    }
  }

  submit(): void {
    this.errorMessage = '';
    this.isLoading = true;

    if (this.mode === 'login') {
      this.authService.login(this.email, this.password).subscribe({
        next: () => { this.isLoading = false; this.router.navigate(['/admin']); },
        error: (err) => { this.isLoading = false; this.errorMessage = 'Invalid email or password.'; }
      });
    } else {
      if (!this.name.trim()) { this.errorMessage = 'Name is required.'; this.isLoading = false; return; }
      this.authService.register(this.name, this.email, this.password).subscribe({
        next: () => { this.mode = 'login'; this.isLoading = false; this.errorMessage = ''; alert('Registered! Please login.'); },
        error: (err) => { this.isLoading = false; this.errorMessage = err.error?.message || 'Registration failed.'; }
      });
    }
  }
}
