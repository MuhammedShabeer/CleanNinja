using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CleanNinja.Server.Data;
using CleanNinja.Server.Models;
using System.Security.Claims;

namespace CleanNinja.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminUsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminUsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/AdminUsers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAdminUsers()
        {
            var users = await _context.AdminUsers
                .AsNoTracking()
                .Select(u => new { 
                    u.Id, 
                    u.Name, 
                    u.Email, 
                    u.AllowedMenus, 
                    u.CreatedAt 
                })
                .ToListAsync();
            return Ok(users);
        }

        // POST: api/AdminUsers
        [HttpPost]
        public async Task<ActionResult<AdminUser>> CreateAdminUser(AdminUserCreateDto dto)
        {
            if (await _context.AdminUsers.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest("Email already exists.");
            }

            var user = new AdminUser
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                AllowedMenus = dto.AllowedMenus
            };

            _context.AdminUsers.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { user.Id, user.Name, user.Email, user.AllowedMenus });
        }

        // PUT: api/AdminUsers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAdminUser(int id, AdminUserUpdateDto dto)
        {
            var user = await _context.AdminUsers.FindAsync(id);
            if (user == null) return NotFound();

            user.Name = dto.Name;
            user.Email = dto.Email;
            user.AllowedMenus = dto.AllowedMenus;

            if (!string.IsNullOrEmpty(dto.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/AdminUsers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAdminUser(int id)
        {
            var user = await _context.AdminUsers.FindAsync(id);
            if (user == null) return NotFound();

            // Prevent self-deletion if the user is authenticated (simplified check)
            // In a real app, check against the current user's ID from claims.
            
            _context.AdminUsers.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class AdminUserCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string AllowedMenus { get; set; } = "all";
    }

    public class AdminUserUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Password { get; set; } // Optional password update
        public string AllowedMenus { get; set; } = "all";
    }
}
