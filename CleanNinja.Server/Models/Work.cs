namespace CleanNinja.Server.Models
{
    public class Work
    {
        public int Id { get; set; }
        public int? BookingId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string ServicePackage { get; set; } = string.Empty;
        public string? Address { get; set; }
        public int? AssignedEmployeeId { get; set; }
        public string? AssignedEmployeeName { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public decimal Revenue { get; set; } = 0;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
