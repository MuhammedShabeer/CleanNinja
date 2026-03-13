using System;

namespace CleanNinja.Server.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public required string CustomerName { get; set; }
        public required string Phone { get; set; }
        public required string ServicePackage { get; set; } // e.g., "Silver", "Gold"
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Status { get; set; } = "Pending"; // "Pending", "Approved"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
