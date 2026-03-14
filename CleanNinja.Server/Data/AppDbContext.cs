using Microsoft.EntityFrameworkCore;
using CleanNinja.Server.Models;

namespace CleanNinja.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Booking> Bookings { get; set; } = null!;
        public DbSet<SiteContent> SiteContent { get; set; } = null!;
        public DbSet<Employee> Employees { get; set; } = null!;
        public DbSet<AdminUser> AdminUsers { get; set; } = null!;
        public DbSet<Service> Services { get; set; } = null!;
        public DbSet<ServiceMedia> ServiceMedia { get; set; } = null!;
        public DbSet<ServiceFeedback> ServiceFeedbacks { get; set; } = null!;
    }
}
