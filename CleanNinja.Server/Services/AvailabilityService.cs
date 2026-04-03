using CleanNinja.Server.Data;
using CleanNinja.Server.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CleanNinja.Server.Services
{
    public interface IAvailabilityService
    {
        Task<List<DateTime>> GetAvailableSlotsAsync(int serviceId, DateTime date);
    }

    public class AvailabilityService : IAvailabilityService
    {
        private readonly AppDbContext _context;

        public AvailabilityService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<DateTime>> GetAvailableSlotsAsync(int serviceId, DateTime date)
        {
            var service = await _context.Services.FindAsync(serviceId);
            if (service == null) return new List<DateTime>();

            int duration = service.DefaultDurationMinutes;
            int dayOfWeek = (int)date.DayOfWeek;

            var workingHour = await _context.WorkingHours
                .FirstOrDefaultAsync(w => w.DayOfWeek == dayOfWeek && !w.IsClosed);

            if (workingHour == null) return new List<DateTime>();

            // Business window
            var startBusiness = date.Date.Add(workingHour.StartTime);
            var endBusiness = date.Date.Add(workingHour.EndTime);

            // Fetch existing schedules for that day
            var existingSchedules = await _context.WorkSchedules
                .Where(s => s.ScheduledStart >= date.Date && s.ScheduledStart < date.Date.AddDays(1) && s.Status != "Cancelled")
                .OrderBy(s => s.ScheduledStart)
                .ToListAsync();

            var slots = new List<DateTime>();
            var currentPos = startBusiness;

            // Simple gap-filling algorithm
            while (currentPos.AddMinutes(duration) <= endBusiness)
            {
                var nextEnd = currentPos.AddMinutes(duration);
                
                // Check if this slot overlaps with any existing schedule
                bool isOverlap = existingSchedules.Any(s => 
                    (currentPos >= s.ScheduledStart && currentPos < s.ScheduledEnd) ||
                    (nextEnd > s.ScheduledStart && nextEnd <= s.ScheduledEnd) ||
                    (currentPos <= s.ScheduledStart && nextEnd >= s.ScheduledEnd)
                );

                if (!isOverlap)
                {
                    slots.Add(currentPos);
                }

                // Move by 30-minute increments for slot visibility
                currentPos = currentPos.AddMinutes(30);
            }

            return slots;
        }
    }
}
