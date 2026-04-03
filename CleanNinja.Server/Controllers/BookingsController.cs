using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CleanNinja.Server.Data;
using CleanNinja.Server.Models;

namespace CleanNinja.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly Services.IAvailabilityService _availabilityService;

        public BookingsController(AppDbContext context, Services.IAvailabilityService availabilityService)
        {
            _context = context;
            _availabilityService = availabilityService;
        }

        [HttpGet("available-slots")]
        public async Task<ActionResult<IEnumerable<DateTime>>> GetAvailableSlots([FromQuery] int serviceId, [FromQuery] DateTime date)
        {
            return await _availabilityService.GetAvailableSlotsAsync(serviceId, date);
        }

        // GET: api/bookings/pending
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetPendingBookings()
        {
            return await _context.Bookings
                .Include(b => b.AssignedEmployees)
                .Where(b => b.Status == "Pending")
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        // GET: api/bookings/all — list for Works tab
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetAllBookings()
        {
            return await _context.Bookings
                .Include(b => b.AssignedEmployees)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        // GET: api/bookings/calendar — fetch discrete schedules
        [HttpGet("calendar")]
        public async Task<ActionResult<IEnumerable<WorkSchedule>>> GetCalendarWork([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            return await _context.WorkSchedules
                .Include(s => s.Booking)
                .Where(s => s.ScheduledStart >= start && s.ScheduledStart <= end)
                .ToListAsync();
        }

        // GET: api/bookings/schedules — recurring frequency OR has a ScheduledDate
        [HttpGet("schedules")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetSchedules()
        {
            return await _context.Bookings
                .Include(b => b.AssignedEmployees)
                .Where(b => b.ScheduledDate != null || (b.Frequency != null && b.Frequency != "Once"))
                .OrderBy(b => b.ScheduledDate ?? b.CreatedAt)
                .ToListAsync();
        }

        // POST: api/bookings — customer-facing booking
        [HttpPost]
        public async Task<ActionResult<Booking>> CreateBooking(Booking booking)
        {
            booking.Status = "Pending";
            booking.CreatedAt = DateTime.UtcNow;

            // If duration not set, use default from service
            if (booking.DurationMinutes <= 0)
            {
                var service = await _context.Services.FirstOrDefaultAsync(s => s.Name == booking.ServicePackage);
                booking.DurationMinutes = service?.DefaultDurationMinutes ?? 60;
            }

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPendingBookings), new { id = booking.Id }, booking);
        }

        // POST: api/bookings/schedule — admin creates a scheduled job
        [HttpPost("schedule")]
        public async Task<ActionResult<Booking>> CreateSchedule(Booking booking)
        {
            booking.Status = "Pending";
            booking.CreatedAt = DateTime.UtcNow;
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSchedules), new { id = booking.Id }, booking);
        }

        // PUT: api/bookings/5/approve — Finalizes and schedules blocks
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveBooking(int id, [FromBody] ApproveBookingRequest? req)
        {
            var booking = await _context.Bookings
                .Include(b => b.WorkSchedules)
                .FirstOrDefaultAsync(b => b.Id == id);
            
            if (booking == null) return NotFound();

            booking.Status = "Accepted";
            if (req?.OverrideDurationMinutes > 0)
            {
                booking.DurationMinutes = req.OverrideDurationMinutes.Value;
            }

            // Generate WorkSchedules
            if (booking.ScheduledDate.HasValue)
            {
                GenerateSchedules(booking);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        private void GenerateSchedules(Booking booking)
        {
            booking.WorkSchedules.Clear();
            var start = booking.ScheduledDate!.Value;
            int count = booking.FrequencyCount > 0 ? booking.FrequencyCount : 1;

            for (int i = 0; i < count; i++)
            {
                DateTime currentStart;
                if (booking.Frequency == "Weekly") currentStart = start.AddDays(i * 7);
                else if (booking.Frequency == "Monthly") currentStart = start.AddMonths(i);
                else if (booking.Frequency == "Two Days") currentStart = start.AddDays(i * 2);
                else currentStart = start.AddDays(i); // Once or Daily

                booking.WorkSchedules.Add(new WorkSchedule
                {
                    BookingId = booking.Id,
                    ScheduledStart = currentStart,
                    ScheduledEnd = currentStart.AddMinutes(booking.DurationMinutes),
                    Status = "Pending"
                });

                if (booking.Frequency == "Once" || string.IsNullOrEmpty(booking.Frequency)) break;
            }
        }

        // PUT: api/bookings/5/accept — accept without WhatsApp
        [HttpPut("{id}/accept")]
        public async Task<IActionResult> AcceptBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();
            booking.Status = "Accepted";
            booking.StartedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/bookings/5/complete
        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteBooking(int id, [FromBody] CompleteBookingRequest req)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();
            booking.Status = "Completed";
            booking.CompletedAt = DateTime.UtcNow;
            booking.Revenue = req.Revenue;
            booking.Notes = req.Notes;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/bookings/5/assign
        [HttpPut("{id}/assign")]
        public async Task<IActionResult> AssignEmployees(int id, [FromBody] int[]? employeeIds)
        {
            try
            {
                if (employeeIds == null) return BadRequest("Employee IDs list is null.");
                
                var booking = await _context.Bookings.Include(b => b.AssignedEmployees).FirstOrDefaultAsync(b => b.Id == id);
                if (booking == null) return NotFound();

                if (employeeIds == null || employeeIds.Length == 0) 
                {
                    booking.AssignedEmployees.Clear();
                }
                else 
                {
                    var idList = employeeIds.ToList();
                    var employees = await _context.Employees
                        .Where(e => idList.Any(id => id == e.Id))
                        .ToListAsync();
                    
                    booking.AssignedEmployees.Clear();
                    foreach(var e in employees)
                    {
                        booking.AssignedEmployees.Add(e);
                    }
                }

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return Problem(detail: ex.ToString(), title: "Assignment Error");
            }
        }

        // PUT: api/bookings/5/schedule-complete — mark a scheduled job done
        [HttpPut("{id}/schedule-complete")]
        public async Task<IActionResult> ScheduleComplete(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();
            booking.Status = "Completed";
            booking.CompletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/bookings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();
            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class CompleteBookingRequest
    {
        public decimal Revenue { get; set; }
        public string? Notes { get; set; }
    }

    public class ApproveBookingRequest
    {
        public int? OverrideDurationMinutes { get; set; }
    }
}
