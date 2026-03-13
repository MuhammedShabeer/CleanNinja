import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContentService, SiteContent } from '../../services/content.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  standalone: false
})
export class Admin implements OnInit, AfterViewInit {
  public activeTab: 'bookings' | 'content' = 'bookings';
  public pendingBookings: any[] = [];
  public contentItems: SiteContent[] = [];
  public whatsAppContact: string = '+447578334674';
  
  private map: any;
  private markers: L.Marker[] = [];

  constructor(
    private http: HttpClient,
    private contentService: ContentService
  ) {}

  ngOnInit(): void {
    this.fetchBookings();
    this.contentService.getContent().subscribe(items => {
      this.contentItems = JSON.parse(JSON.stringify(items)); // Deep copy to edit
      const waItem = this.contentItems.find(c => c.key === 'WhatsAppContact');
      if (waItem) this.whatsAppContact = waItem.value;
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  switchTab(tab: 'bookings' | 'content'): void {
    this.activeTab = tab;
    if (tab === 'bookings') {
      setTimeout(() => { this.map.invalidateSize(); }, 100);
    }
  }

  private initMap(): void {
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl, iconUrl, shadowUrl,
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], tooltipAnchor: [16, -28], shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.map = L.map('admin-map').setView([53.4084, -2.9916], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(this.map);
  }

  fetchBookings(): void {
    this.http.get<any[]>('/api/bookings/pending').subscribe(data => {
      this.pendingBookings = data;
      this.updateMapMarkers();
    });
  }

  updateMapMarkers(): void {
    if (!this.map) return;
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
    
    this.pendingBookings.forEach(b => {
      const marker = L.marker([b.latitude, b.longitude]).addTo(this.map)
        .bindPopup(`<b>${b.customerName}</b><br>${b.servicePackage}<br>${b.phone}`);
      this.markers.push(marker);
    });
  }

  approveBooking(id: number, phone: string, name: string, packageType: string): void {
    this.http.put(`/api/bookings/${id}/approve`, {}).subscribe(() => {
      const waLink = `https://wa.me/${this.whatsAppContact.replace('+', '')}?text=Hi%20${encodeURIComponent(name)},%20your%20${encodeURIComponent(packageType)}%20booking%20is%20approved!`;
      window.open(waLink, '_blank');
      this.fetchBookings();
    });
  }

  saveContentItem(item: SiteContent): void {
    this.contentService.updateContentItem(item).subscribe(() => {
      alert(`Updated ${item.key} successfully.`);
    });
  }
}
