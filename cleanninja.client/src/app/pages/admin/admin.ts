import { Component, OnInit, OnDestroy, ViewEncapsulation, NgZone } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IconSetService } from '@coreui/icons-angular';
import { 
  cilList, cilPeople, cilSettings, cilImage, cilAccountLogout, 
  cilMenu, cilPlus, cilTrash, cilSave, cilStar, cilCheckCircle, 
  cilInfo, cilSpeedometer, cilBriefcase, cilCalendar, cilDollar, 
  cilTask, cilUser, cilWallet 
} from '@coreui/icons';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  standalone: false,
  encapsulation: ViewEncapsulation.None
})
export class Admin implements OnInit, OnDestroy {
  public sidebarVisible: boolean = true;
  public adminName: string = '';
  private pollingInterval: any;
  private lastPendingCount: number = -1;

  constructor(
    private authService: AuthService,
    private router: Router,
    public iconSet: IconSetService,
    private http: HttpClient,
    private ngZone: NgZone
  ) {
    this.iconSet.icons = { 
      cilList, cilPeople, cilSettings, cilImage, cilAccountLogout, 
      cilMenu, cilPlus, cilTrash, cilSave, cilStar, cilCheckCircle, 
      cilInfo, cilSpeedometer, cilBriefcase, cilCalendar, cilDollar, 
      cilTask, cilUser, cilWallet 
    };
  }

  ngOnInit(): void {
    this.adminName = this.authService.getAdminName();
    
    // Auto-hide sidebar on mobile initially
    if (window.innerWidth <= 768) {
      this.sidebarVisible = false;
    }

    // Request notification permission for PWA
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    // Close sidebar on mobile when route changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (window.innerWidth <= 768) {
          this.sidebarVisible = false;
        }
      }
    });

    // Check for new orders
    this.checkNewOrders();
    this.pollingInterval = setInterval(() => {
      this.checkNewOrders();
    }, 10000); // Check every 10 seconds
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  private checkNewOrders() {
    this.http.get<any[]>('/api/bookings/pending').subscribe({
      next: (bookings) => {
        const currentCount = bookings.length;
        if (this.lastPendingCount !== -1 && currentCount > this.lastPendingCount) {
          this.playBeep();
          this.showNotification('New Booking Received!', 'A new booking requires your attention in the dashboard.');
        }
        this.lastPendingCount = currentCount;
      },
      error: (err) => console.error('Failed to fetch pending bookings', err)
    });
  }

  private showNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body: body,
          icon: '/favicon.png',
          badge: '/favicon.png'
        });
        notification.onclick = function() {
          window.focus();
          this.close();
        };
      } catch (e) {
        // Fallback for mobile PWAs that require ServiceWorker Registration to show Notifications
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
              body: body,
              icon: '/favicon.png',
              badge: '/favicon.png'
            });
          });
        }
      }
    }
  }

  private playBeep() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      
      // Beep twice
      setTimeout(() => {
        oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime); // C6 note
      }, 150);
      
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 400);
    } catch (e) {
      console.log('Web Audio API not supported', e);
    }
  }

  public hasAccess(menu: string): boolean {
    const allowed = this.authService.getAllowedMenus();
    if (allowed === 'all') return true;
    const menuList = allowed.toLowerCase().split(',').map(m => m.trim());
    return menuList.includes(menu.toLowerCase());
  }

  navigateTo(path: string): void {
    if (window.innerWidth <= 768) {
      this.sidebarVisible = false;
    }
    this.router.navigate([path]);
  }

  forceNavigate(path: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (window.innerWidth <= 768) {
      this.sidebarVisible = false;
    }

    this.ngZone.run(() => {
      window.location.hash = '#' + path;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
