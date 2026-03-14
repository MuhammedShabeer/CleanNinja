namespace CleanNinja.Server.Models
{
    public class ServiceFeedback
    {
        public int Id { get; set; }
        public int ServiceId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int Rating { get; set; } = 5; // 1–5 stars
        public string Comment { get; set; } = string.Empty;
        public bool IsApproved { get; set; } = false; // Admin must approve
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Service? Service { get; set; }
    }
}
