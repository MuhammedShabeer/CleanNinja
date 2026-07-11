import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
      @Inject(DOCUMENT) private doc: Document,
      @Inject(PLATFORM_ID) private platformId: Object,
      private title: Title,
      private meta: Meta
  ) {}

  public updateSeoTags(titleStr: string, descriptionStr: string): void {
      this.title.setTitle(titleStr);
      this.meta.updateTag({ name: 'description', content: descriptionStr });
      this.meta.updateTag({ property: 'og:title', content: titleStr });
      this.meta.updateTag({ property: 'og:description', content: descriptionStr });
  }

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
          "image": "https://cleanninja.uk/logo.png",
          "address": {
              "@type": "PostalAddress",
              "addressLocality": "Liverpool",
              "addressRegion": "MER",
              "addressCountry": "UK"
          },
          "telephone": content.WhatsAppContact || "+447578334674",
          "url": "https://cleanninja.uk"
      };
  }

  public getBlogPostingSchema(blog: any): any {
      return {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": blog.title,
          "image": blog.imageUrl || "https://cleanninja.uk/logo.png",
          "author": {
              "@type": "Organization",
              "name": blog.author || "Clean Ninja"
          },
          "publisher": {
              "@type": "Organization",
              "name": "Clean Ninja",
              "logo": {
                  "@type": "ImageObject",
                  "url": "https://cleanninja.uk/logo.png"
              }
          },
          "datePublished": blog.createdAt || new Date().toISOString(),
          "description": blog.content ? blog.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : ""
      };
  }
}
