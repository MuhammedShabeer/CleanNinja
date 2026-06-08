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
        Task<List<TimeSlotDto>> GetAvailableSlotsAsync(int serviceId, DateTime date);
    }

    public class AvailabilityService : IAvailabilityService
    {
        private readonly AppDbContext _context;

        public AvailabilityService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<TimeSlotDto>> GetAvailableSlotsAsync(int serviceId, DateTime date)
        {
            var service = await _context.Services.FindAsync(serviceId);
            if (service == null) return new List<TimeSlotDto>();

            int dayOfWeek = (int)date.DayOfWeek;

            var workingHour = await _context.WorkingHours
                .FirstOrDefaultAsync(w => w.DayOfWeek == dayOfWeek && !w.IsClosed);

            if (workingHour == null) return new List<TimeSlotDto>(); // Store is closed

            // Fetch existing schedules for that day
            var existingSchedules = await _context.WorkSchedules
                .Where(s => s.ScheduledStart >= date.Date && s.ScheduledStart < date.Date.AddDays(1) && s.Status != "Cancelled")
                .OrderBy(s => s.ScheduledStart)
                .ToListAsync();

            // Fetch pending bookings that haven't been converted to WorkSchedules yet
            var pendingBookings = await _context.Bookings
                .Where(b => b.Status == "Pending" && b.ScheduledDate != null && b.ScheduledDate >= date.Date && b.ScheduledDate < date.Date.AddDays(1))
                .ToListAsync();

            var slots = new List<TimeSlotDto>();
            
            var timeSlotsConfig = await _context.SiteContent
                .FirstOrDefaultAsync(c => c.Section == "Booking" && c.Key == "TimeSlots");

            string configStr = timeSlotsConfig?.Value ?? "8:00 am to 11:00 am, 11:00 am to 2:00 pm, 2:00 pm to 5:00 pm, 5:00 pm to 8:00 pm";

            var slotLabels = configStr.Split(',').Select(s => s.Trim()).Where(s => !string.IsNullOrEmpty(s));

            foreach (var label in slotLabels)
            {
                // Parse the start time from "8:00 am to 11:00 am"
                var parts = label.Split(new[] { "to", "-" }, StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length > 0 && DateTime.TryParse(parts[0].Trim(), out DateTime parsedStart))
                {
                    var currentPos = date.Date.Add(parsedStart.TimeOfDay);
                    
                    DateTime nextEnd = currentPos.AddHours(3); // Default if parsing end fails
                    if (parts.Length > 1 && DateTime.TryParse(parts[1].Trim(), out DateTime parsedEnd))
                    {
                        nextEnd = date.Date.Add(parsedEnd.TimeOfDay);
                        if (nextEnd < currentPos) nextEnd = nextEnd.AddDays(1); // Handle cases crossing midnight if any
                    }

                    // Check if this slot overlaps with any existing schedule or pending booking
                    bool isOverlap = existingSchedules.Any(s => 
                        (currentPos >= s.ScheduledStart && currentPos < s.ScheduledEnd) ||
                        (nextEnd > s.ScheduledStart && nextEnd <= s.ScheduledEnd) ||
                        (currentPos <= s.ScheduledStart && nextEnd >= s.ScheduledEnd)
                    ) || pendingBookings.Any(b => 
                        (currentPos >= b.ScheduledDate!.Value && currentPos < b.ScheduledDate.Value.AddMinutes(b.DurationMinutes)) ||
                        (nextEnd > b.ScheduledDate!.Value && nextEnd <= b.ScheduledDate.Value.AddMinutes(b.DurationMinutes)) ||
                        (currentPos <= b.ScheduledDate!.Value && nextEnd >= b.ScheduledDate.Value.AddMinutes(b.DurationMinutes))
                    );

                    if (!isOverlap)
                    {
                        slots.Add(new TimeSlotDto
                        {
                            Value = currentPos.ToString("o"),
                            Label = label
                        });
                    }
                }
            }

            return slots;
        }
    }
}
