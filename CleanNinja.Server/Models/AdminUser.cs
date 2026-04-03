namespace CleanNinja.Server.Models
{
    public class AdminUser
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string AllowedMenus { get; set; } = "all"; // Comma-separated list like "dashboard,bookings,revenue"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
