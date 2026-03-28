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

        public BookingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/bookings/pending
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetPendingBookings()
        {
            return await _context.Bookings
                .Include(b => b.AssignedEmployees)
                .Where(b => b.Status == "Pending" && (b.Frequency == null || b.Frequency == "Once") && b.ScheduledDate == null)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        // GET: api/bookings/all — non-scheduled bookings = Works
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetAllBookings()
        {
            return await _context.Bookings
                .Include(b => b.AssignedEmployees)
                .Where(b => (b.Frequency == null || b.Frequency == "Once") && b.ScheduledDate == null)
                .OrderByDescending(b => b.CreatedAt)
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

        // PUT: api/bookings/5/approve — legacy, sends WhatsApp (kept for backward compat)
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();
            booking.Status = "Accepted";
            await _context.SaveChangesAsync();
            return NoContent();
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
                    booking.AssignedEmployeeName = "";
                    booking.AssignedEmployeeId = null;
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
                    booking.AssignedEmployeeName = string.Join(", ", employees.Select(e => e.Name));
                    booking.AssignedEmployeeId = employees.FirstOrDefault()?.Id;
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
}
