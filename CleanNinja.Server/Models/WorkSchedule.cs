using System;
using System.ComponentModel.DataAnnotations;

namespace CleanNinja.Server.Models
{
    public class WorkSchedule
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        
        [Required]
        public DateTime ScheduledStart { get; set; }
        
        [Required]
        public DateTime ScheduledEnd { get; set; }
        
        // Status: Pending, Completed, Cancelled
        public string Status { get; set; } = "Pending";
        
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [System.Text.Json.Serialization.JsonIgnore]
        public Booking? Booking { get; set; }
    }
}
