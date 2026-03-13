import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
      @Inject(DOCUMENT) private doc: Document,
      @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  public setJsonLd(data: any): void {
      if (isPlatformBrowser(this.platformId)) {
          let script = this.doc.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
          if (!script) {
              script = this.doc.createElement('script');
              script.type = 'application/ld+json';
              this.doc.head.appendChild(script);
          }
          script.text = JSON.stringify(data);
      }
  }

  public getLocalBusinessSchema(content: any): any {
      return {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Clean Ninja",
          "image": "https://cleanninja.com/logo.png",
          "address": {
              "@type": "PostalAddress",
              "addressLocality": "Liverpool",
              "addressRegion": "MER",
              "addressCountry": "UK"
          },
          "telephone": content.WhatsAppContact || "+447578334674",
          "url": "https://cleanninja.com"
      };
  }
}
