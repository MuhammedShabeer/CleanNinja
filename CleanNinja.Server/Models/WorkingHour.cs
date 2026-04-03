using System;

namespace CleanNinja.Server.Models
{
    public class WorkingHour
    {
        public int Id { get; set; }
        public int DayOfWeek { get; set; } // 0=Sunday, 1=Monday, etc.
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsClosed { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
