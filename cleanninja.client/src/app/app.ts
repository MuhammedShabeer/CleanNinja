import { Component, HostListener, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false
})
export class App implements OnInit {
  public showBrandedHeader: boolean = true;
  public deferredPrompt: any;
  public showInstallButton: boolean = false;

  constructor(
    private swUpdate: SwUpdate,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateVisibility(event.urlAfterRedirects);
    });
  }

  ngOnInit(): void {
    this.updateVisibility(this.router.url);
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(evt => {
        switch (evt.type) {
          case 'VERSION_DETECTED':
            console.log(`Downloading new app version: ${evt.version.hash}`);
            break;
          case 'VERSION_READY':
            console.log(`Current app version: ${evt.currentVersion.hash}`);
            console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
            if (confirm('A new version of Clean Ninja is available. Reload now to update?')) {
              window.location.reload();
            }
            break;
          case 'VERSION_INSTALLATION_FAILED':
            console.error(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
            break;
        }
      });
    }
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onbeforeinstallprompt(e: any) {
    e.preventDefault();
    this.deferredPrompt = e;
    this.showInstallButton = true;
  }

  public installPwa(): void {
    this.showInstallButton = false;
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        this.deferredPrompt = null;
      });
    }
  }

  private updateVisibility(url: string): void {
    // Hide branded header/banner on admin routes
    this.showBrandedHeader = !url.includes('/admin');
  }
}
