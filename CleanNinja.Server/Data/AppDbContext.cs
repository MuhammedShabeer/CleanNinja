using Microsoft.EntityFrameworkCore;
using CleanNinja.Server.Models;

namespace CleanNinja.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Booking> Bookings { get; set; }
        public DbSet<SiteContent> SiteContent { get; set; }
    }
}
