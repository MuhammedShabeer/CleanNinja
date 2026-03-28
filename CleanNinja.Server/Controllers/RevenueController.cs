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
                .Where(w => w.Status == "Completed")
                .ToListAsync();

            var totalEarned = completedBookings.Sum(w => w.Revenue);
            var totalExpenses = await _context.Expenses.SumAsync(e => e.Amount);
            var pendingCount = await _context.Bookings.CountAsync(w => w.Status == "Pending" && w.ScheduledDate == null);
            var completedCount = completedBookings.Count(w => w.ScheduledDate == null);

            return Ok(new
            {
                totalEarned,
                totalExpenses,
                netProfit = totalEarned - totalExpenses,
                pendingCount,
                completedCount,
                works = completedBookings.Where(w => w.ScheduledDate == null).Select(w => new
                {
                    w.Id,
                    w.CustomerName,
                    w.ServicePackage,
                    w.AssignedEmployeeName,
                    w.Revenue,
                    w.CompletedAt
                })
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
