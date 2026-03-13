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

        public ContentController(AppDbContext context)
        {
            _context = context;
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
    }
}
