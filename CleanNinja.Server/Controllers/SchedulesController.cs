using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CleanNinja.Server.Data;
using CleanNinja.Server.Models;

namespace CleanNinja.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SchedulesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SchedulesController(AppDbContext context) { _context = context; }

        // GET: api/schedules
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ScheduledWork>>> GetAll()
            => await _context.ScheduledWorks.OrderBy(s => s.ScheduledDate).ToListAsync();

        // POST: api/schedules
        [HttpPost]
        public async Task<ActionResult<ScheduledWork>> Create(ScheduledWork schedule)
        {
            schedule.CreatedAt = DateTime.UtcNow;
            _context.ScheduledWorks.Add(schedule);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = schedule.Id }, schedule);
        }

        // PUT: api/schedules/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ScheduledWork updated)
        {
            var s = await _context.ScheduledWorks.FindAsync(id);
            if (s == null) return NotFound();
            s.Title = updated.Title;
            s.CustomerName = updated.CustomerName;
            s.Phone = updated.Phone;
            s.ServicePackage = updated.ServicePackage;
            s.ScheduledDate = updated.ScheduledDate;
            s.AssignedEmployeeId = updated.AssignedEmployeeId;
            s.AssignedEmployeeName = updated.AssignedEmployeeName;
            s.Notes = updated.Notes;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/schedules/{id}/complete
        [HttpPut("{id}/complete")]
        public async Task<IActionResult> Complete(int id)
        {
            var s = await _context.ScheduledWorks.FindAsync(id);
            if (s == null) return NotFound();
            s.IsCompleted = true;
            s.CompletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/schedules/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var s = await _context.ScheduledWorks.FindAsync(id);
            if (s == null) return NotFound();
            _context.ScheduledWorks.Remove(s);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
