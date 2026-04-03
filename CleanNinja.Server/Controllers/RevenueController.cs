using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CleanNinja.Server.Data;
using CleanNinja.Server.Models;

namespace CleanNinja.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RevenueController : ControllerBase
    {
        private readonly AppDbContext _context;
        public RevenueController(AppDbContext context) { _context = context; }

        // GET: api/revenue/summary
        [HttpGet("summary")]
        public async Task<ActionResult<object>> GetSummary()
        {
            var completedBookings = await _context.Bookings
                .Include(b => b.AssignedEmployees)
                .Where(w => w.Status == "Completed")
                .AsNoTracking()
                .ToListAsync();

            var totalEarned = completedBookings.Sum(w => w.Revenue);
            var totalExpenses = await _context.Expenses.SumAsync(e => e.Amount);
            
            var pendingCount = await _context.Bookings.CountAsync(w => w.Status == "Pending");
            var completedCount = completedBookings.Count();

            // Project to an anonymous object list to avoid potential JSON circular reference or model proxy issues
            var worksList = completedBookings.Select(w => new
            {
                w.Id,
                w.CustomerName,
                w.ServicePackage,
                AssignedEmployeeName = (w.AssignedEmployees != null && w.AssignedEmployees.Any())
                    ? string.Join(", ", w.AssignedEmployees.Select(e => e.Name))
                    : "Unassigned",
                w.Revenue,
                CompletedAt = w.CompletedAt?.ToString("yyyy-MM-dd HH:mm")
            }).ToList();

            return Ok(new
            {
                totalEarned,
                totalExpenses,
                netProfit = totalEarned - totalExpenses,
                pendingCount,
                completedCount,
                works = worksList
            });
        }

        // GET: api/revenue/expenses
        [HttpGet("expenses")]
        public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses()
            => await _context.Expenses.OrderByDescending(e => e.Date).ToListAsync();

        // POST: api/revenue/expenses
        [HttpPost("expenses")]
        public async Task<ActionResult<Expense>> AddExpense(Expense expense)
        {
            expense.CreatedAt = DateTime.UtcNow;
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetExpenses), new { id = expense.Id }, expense);
        }

        // DELETE: api/revenue/expenses/{id}
        [HttpDelete("expenses/{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return NotFound();
            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
