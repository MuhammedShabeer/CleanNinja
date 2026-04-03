using System;
using System.Collections.Generic;

namespace CleanNinja.Server.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public required string CustomerName { get; set; }
        public required string Phone { get; set; }
        public required string ServicePackage { get; set; }
        public string? Address { get; set; }
        public string? Frequency { get; set; }
        public int FrequencyCount { get; set; } = 1; // e.g. 3 months, 4 weeks
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int DurationMinutes { get; set; } = 60;

        // Status flow: Pending → Accepted → Completed
        public string Status { get; set; } = "Pending";

        public ICollection<Employee> AssignedEmployees { get; set; } = new List<Employee>();
        public List<WorkSchedule> WorkSchedules { get; set; } = new();

        // Work lifecycle
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public decimal Revenue { get; set; } = 0;
        public string? Notes { get; set; }

        // Schedule support — null means it's a regular on-demand booking
        public DateTime? ScheduledDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
