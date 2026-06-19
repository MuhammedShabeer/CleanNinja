using CleanNinja.Server.Models;
using CleanNinja.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace CleanNinja.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public ContactController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitContactInquiry([FromBody] ContactRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Name and Message are required.");
            }

            await _emailService.SendContactInquiryAsync(request);

            return Ok(new { message = "Inquiry sent successfully" });
        }
    }
}
