using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
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
        public DbSet<GalleryImage> GalleryImages { get; set; } = null!;
        public DbSet<ServiceFeedback> ServiceFeedbacks { get; set; } = null!;
        public DbSet<Expense> Expenses { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Booking>()
                .HasMany(b => b.AssignedEmployees)
                .WithMany(e => e.Bookings)
                .UsingEntity<Dictionary<string, object>>(
                    "BookingEmployee",
                    j => j.HasOne<Employee>().WithMany().HasForeignKey("AssignedEmployeesId"),
                    j => j.HasOne<Booking>().WithMany().HasForeignKey("BookingsId"),
                    j =>
                    {
                        j.HasKey("BookingsId", "AssignedEmployeesId");
                        j.ToTable("BookingEmployee");
                    }
                );
        }
    }
}
