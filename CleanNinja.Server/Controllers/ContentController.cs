using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CleanNinja.Server.Data;
using CleanNinja.Server.Models;

namespace CleanNinja.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ContentController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/content
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SiteContent>>> GetAllContent()
        {
            return await _context.SiteContent.ToListAsync();
        }

        // GET: api/content/section/LandingPage
        [HttpGet("section/{section}")]
        public async Task<ActionResult<IEnumerable<SiteContent>>> GetContentBySection(string section)
        {
            return await _context.SiteContent.Where(s => s.Section == section).ToListAsync();
        }

        // PUT: api/content/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContent(int id, SiteContent content)
        {
            if (id != content.Id) return BadRequest();

            _context.Entry(content).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SiteContentExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        private bool SiteContentExists(int id)
        {
            return _context.SiteContent.Any(e => e.Id == id);
        }

        // POST: api/content/upload-flyer
        [HttpPost("upload-flyer")]
        public async Task<IActionResult> UploadFlyer(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("No file provided.");

            var ext = Path.GetExtension(file.FileName).ToLower();
            if (!new[] { ".png", ".jpg", ".jpeg", ".gif", ".webp" }.Contains(ext))
            {
                return BadRequest("Invalid image format.");
            }

            var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "flyers");
            Directory.CreateDirectory(uploadsDir);
            var uniqueName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsDir, uniqueName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var fileUrl = $"/uploads/flyers/{uniqueName}";

            var flyerUrlContent = await _context.SiteContent.FirstOrDefaultAsync(s => s.Key == "OfferFlyerUrl");
            if (flyerUrlContent != null)
            {
                flyerUrlContent.Value = fileUrl;
            }
            else
            {
                _context.SiteContent.Add(new SiteContent { Section = "Offers", Key = "OfferFlyerUrl", Value = fileUrl });
            }

            var flyerActiveContent = await _context.SiteContent.FirstOrDefaultAsync(s => s.Key == "OfferFlyerActive");
            if (flyerActiveContent != null)
            {
                flyerActiveContent.Value = "true"; // Auto-activate on upload
            }
            else
            {
                _context.SiteContent.Add(new SiteContent { Section = "Offers", Key = "OfferFlyerActive", Value = "true" });
            }

            await _context.SaveChangesAsync();
            return Ok(new { url = fileUrl });
        }
    }
}
