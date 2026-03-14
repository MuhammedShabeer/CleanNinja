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
                .Where(b => b.Status == "Pending")
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        // POST: api/bookings
        [HttpPost]
        public async Task<ActionResult<Booking>> CreateBooking(Booking booking)
        {
            booking.Status = "Pending";
            booking.CreatedAt = DateTime.UtcNow;

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPendingBookings), new { id = booking.Id }, booking);
        }

        // PUT: api/bookings/5/approve
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            booking.Status = "Approved";
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/bookings/5/assign/3
        [HttpPut("{id}/assign/{employeeId}")]
        public async Task<IActionResult> AssignEmployee(int id, int employeeId)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null) return NotFound();

            booking.AssignedEmployeeId = employeeId;
            booking.AssignedEmployeeName = employee.Name;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/bookings/all
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<Booking>>> GetAllBookings()
        {
            return await _context.Bookings
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }
    }
}
