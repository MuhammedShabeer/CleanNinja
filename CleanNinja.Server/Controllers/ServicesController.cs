using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CleanNinja.Server.Data;
using CleanNinja.Server.Models;

namespace CleanNinja.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ServicesController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/services
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Service>>> GetServices()
        {
            return await _context.Services
                .Where(s => s.IsActive)
                .Include(s => s.Media)
                .Include(s => s.Feedbacks.Where(f => f.IsApproved))
                .OrderBy(s => s.SortOrder)
                .ToListAsync();
        }

        // POST: api/services
        [HttpPost]
        public async Task<ActionResult<Service>> CreateService([FromBody] Service service)
        {
            service.IsActive = true;
            service.CreatedAt = DateTime.UtcNow;
            _context.Services.Add(service);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetServices), new { id = service.Id }, service);
        }

        // PUT: api/services/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] Service updated)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return NotFound();
            service.Name = updated.Name;
            service.Description = updated.Description;
            service.Icon = updated.Icon;
            service.SortOrder = updated.SortOrder;
            service.Price = updated.Price;
            service.DiscountedPrice = updated.DiscountedPrice;
            service.WeeklyPrice = updated.WeeklyPrice;
            service.MonthlyPrice = updated.MonthlyPrice;
            service.YearlyPrice = updated.YearlyPrice;
            service.IsHighlighted = updated.IsHighlighted;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/services/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return NotFound();
            service.IsActive = false;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/services/5/media
        [HttpPost("{id}/media")]
        public async Task<IActionResult> UploadMedia(int id, IFormFile file)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return NotFound();
            if (file == null || file.Length == 0) return BadRequest("No file provided.");

            // Determine type
            var ext = Path.GetExtension(file.FileName).ToLower();
            var isVideo = new[] { ".mp4", ".mov", ".webm", ".avi" }.Contains(ext);
            var fileType = isVideo ? "video" : "image";

            // Save to disk
            var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "services");
            Directory.CreateDirectory(uploadsDir);
            var uniqueName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsDir, uniqueName);
            await using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var media = new ServiceMedia
            {
                ServiceId = id,
                FileName = file.FileName,
                FileType = fileType,
                Url = $"/uploads/services/{uniqueName}",
                CreatedAt = DateTime.UtcNow
            };
            _context.ServiceMedia.Add(media);
            await _context.SaveChangesAsync();

            return Ok(media);
        }

        // DELETE: api/services/5/media/3
        [HttpDelete("{id}/media/{mediaId}")]
        public async Task<IActionResult> DeleteMedia(int id, int mediaId)
        {
            var media = await _context.ServiceMedia.FindAsync(mediaId);
            if (media == null || media.ServiceId != id) return NotFound();

            // Delete physical file
            var filePath = Path.Combine(_env.WebRootPath, media.Url.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
            if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);

            _context.ServiceMedia.Remove(media);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
