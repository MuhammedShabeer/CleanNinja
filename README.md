# Clean Ninja - Managed Booking PWA

**Clean Ninja** is a high-performance Progressive Web App (PWA) designed for a mobile car wash and cleaning startup in **Liverpool**. The system features a dynamic content engine, allowing administrators to manage service packages, pricing, and bookings in real-time.

## 🚀 Key Features

* **Progressive Web App (PWA):** Installable on iOS and Android with offline support via Service Workers.
* **Dynamic CMS:** Admin-controlled pricing and service details for "Silver" and "Gold" packages.
* **Location-Based Booking:** Interactive GPS pinning for precise service delivery in the Liverpool area.
* **Admin Approval Workflow:** Managed dashboard to review, approve, and initiate customer contact via WhatsApp.
* **Local SEO:** Integrated JSON-LD Schema for enhanced visibility in UK local search results.

## 🛠 Tech Stack

### Frontend

* **Angular:** Single Page Application (SPA) architecture.
* **Leaflet.js:** For GPS map pinning and location tracking.
* **SCSS:** Custom styling following the "Red & Black" Ninja brand identity.

### Backend

* **ASP.NET Core 10:** Robust Web API handling business logic and security.
* **SQL Server:** Relational database for dynamic content and transaction storage.
* **JWT Authentication:** Secure access for the Admin dashboard routes.
---

## 💻 Getting Started

### Prerequisites

* Node.js (v24+)
* .NET 10 SDK
* SQL Server

---

## 📈 Business Logic: Managed Approval

The system avoids automated checkout to maintain service quality.

1. **Request:** User submits a booking with a GPS pin.
2. **Review:** Admin reviews the location and package in the `/admin` portal.
3. **Action:** Admin clicks "Approve," triggering a manual WhatsApp chat link (`+44 7578334674`) to finalize the schedule.

---

## 📄 License

This project is developed by **Muhammed Shabeer**. All rights reserved.
