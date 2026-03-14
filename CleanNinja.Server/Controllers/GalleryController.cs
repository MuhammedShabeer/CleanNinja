using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CleanNinja.Server.Data;
using CleanNinja.Server.Models;

namespace CleanNinja.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GalleryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public GalleryController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/gallery
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GalleryImage>>> GetGallery()
        {
            return await _context.GalleryImages
                .OrderBy(i => i.SortOrder)
                .ThenByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        // POST: api/gallery
        [HttpPost]
        public async Task<IActionResult> UploadImage(IFormFile file, [FromForm] string title = "")
        {
            if (file == null || file.Length == 0) return BadRequest("No file provided.");

            var ext = Path.GetExtension(file.FileName).ToLower();
            var allowedExts = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            if (!allowedExts.Contains(ext)) return BadRequest("Invalid file type.");

            var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "gallery");
            Directory.CreateDirectory(uploadsDir);
            
            var uniqueName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsDir, uniqueName);
            
            await using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var image = new GalleryImage
            {
                Url = $"/uploads/gallery/{uniqueName}",
                Title = title,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.GalleryImages.Add(image);
            await _context.SaveChangesAsync();

            return Ok(image);
        }

        // DELETE: api/gallery/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteImage(int id)
        {
            var image = await _context.GalleryImages.FindAsync(id);
            if (image == null) return NotFound();

            // Delete physical file
            var filePath = Path.Combine(_env.WebRootPath, image.Url.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
            if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);

            _context.GalleryImages.Remove(image);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
