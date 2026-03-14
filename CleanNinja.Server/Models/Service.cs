using CleanNinja.Server.Models;

namespace CleanNinja.Server.Models
{
    public class Service
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = "🔧"; // emoji or text
        public bool IsActive { get; set; } = true;
        public bool IsHighlighted { get; set; } = false;
        public int SortOrder { get; set; } = 0;
        public decimal? Price { get; set; }
        public decimal? DiscountedPrice { get; set; }
        public decimal? WeeklyPrice { get; set; }
        public decimal? MonthlyPrice { get; set; }
        public decimal? YearlyPrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<ServiceMedia> Media { get; set; } = new();
        public List<ServiceFeedback> Feedbacks { get; set; } = new();
    }
}
