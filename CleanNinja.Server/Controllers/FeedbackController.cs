using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CleanNinja.Server.Data;
using CleanNinja.Server.Models;

namespace CleanNinja.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FeedbackController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/feedback/{serviceId} — public, only approved
        [HttpGet("{serviceId}")]
        public async Task<ActionResult<IEnumerable<ServiceFeedback>>> GetFeedback(int serviceId)
        {
            return await _context.ServiceFeedbacks
                .Where(f => f.ServiceId == serviceId && f.IsApproved)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        // GET: api/feedback/{serviceId}/all — all incl unapproved (for admin)
        [HttpGet("{serviceId}/all")]
        public async Task<ActionResult<IEnumerable<ServiceFeedback>>> GetAllFeedback(int serviceId)
        {
            return await _context.ServiceFeedbacks
                .Where(f => f.ServiceId == serviceId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        // POST: api/feedback — public submission
        [HttpPost]
        public async Task<IActionResult> SubmitFeedback([FromBody] ServiceFeedback feedback)
        {
            if (string.IsNullOrWhiteSpace(feedback.CustomerName) || string.IsNullOrWhiteSpace(feedback.Comment))
                return BadRequest("Name and comment are required.");
            if (feedback.Rating < 1 || feedback.Rating > 5)
                return BadRequest("Rating must be between 1 and 5.");

            feedback.IsApproved = false;
            feedback.CreatedAt = DateTime.UtcNow;
            _context.ServiceFeedbacks.Add(feedback);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Thank you for your feedback! It will appear after review." });
        }

        // PUT: api/feedback/{id}/approve — admin approve
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveFeedback(int id)
        {
            var fb = await _context.ServiceFeedbacks.FindAsync(id);
            if (fb == null) return NotFound();
            fb.IsApproved = true;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/feedback/{id} — admin delete
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeedback(int id)
        {
            var fb = await _context.ServiceFeedbacks.FindAsync(id);
            if (fb == null) return NotFound();
            _context.ServiceFeedbacks.Remove(fb);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
