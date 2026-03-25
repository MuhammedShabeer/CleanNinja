using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CleanNinja.Server.Data;
using CleanNinja.Server.Models;

namespace CleanNinja.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorksController : ControllerBase
    {
        private readonly AppDbContext _context;
        public WorksController(AppDbContext context) { _context = context; }

        // GET: api/works
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Work>>> GetAll()
            => await _context.Works.OrderByDescending(w => w.CreatedAt).ToListAsync();

        // POST: api/works
        [HttpPost]
        public async Task<ActionResult<Work>> Create(Work work)
        {
            work.CreatedAt = DateTime.UtcNow;
            _context.Works.Add(work);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = work.Id }, work);
        }

        // POST: api/works/from-booking/{bookingId}
        [HttpPost("from-booking/{bookingId}")]
        public async Task<ActionResult<Work>> CreateFromBooking(int bookingId)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null) return NotFound();

            var work = new Work
            {
                BookingId = booking.Id,
                CustomerName = booking.CustomerName,
                Phone = booking.Phone,
                ServicePackage = booking.ServicePackage,
                Address = booking.Address,
                AssignedEmployeeId = booking.AssignedEmployeeId,
                AssignedEmployeeName = booking.AssignedEmployeeName,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Works.Add(work);
            booking.Status = "Approved"; // Mark booking as accepted
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = work.Id }, work);
        }

        // PUT: api/works/{id}/accept
        [HttpPut("{id}/accept")]
        public async Task<IActionResult> Accept(int id)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null) return NotFound();
            work.Status = "InProgress";
            work.StartedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/works/{id}/assign/{employeeId}
        [HttpPut("{id}/assign/{employeeId}")]
        public async Task<IActionResult> Assign(int id, int employeeId)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null) return NotFound();
            var emp = await _context.Employees.FindAsync(employeeId);
            if (emp == null) return NotFound();
            work.AssignedEmployeeId = employeeId;
            work.AssignedEmployeeName = emp.Name;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/works/{id}/complete
        [HttpPut("{id}/complete")]
        public async Task<IActionResult> Complete(int id, [FromBody] CompleteWorkRequest req)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null) return NotFound();
            work.Status = "Completed";
            work.CompletedAt = DateTime.UtcNow;
            work.Revenue = req.Revenue;
            work.Notes = req.Notes;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/works/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var work = await _context.Works.FindAsync(id);
            if (work == null) return NotFound();
            _context.Works.Remove(work);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class CompleteWorkRequest
    {
        public decimal Revenue { get; set; }
        public string? Notes { get; set; }
    }
}
