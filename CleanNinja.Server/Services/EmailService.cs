using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using CleanNinja.Server.Models;

namespace CleanNinja.Server.Services
{
    public interface IEmailService
    {
        Task SendBookingConfirmationAsync(Booking booking);
        Task SendContactInquiryAsync(ContactRequest request);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendBookingConfirmationAsync(Booking booking)
        {
            try
            {
                var smtpServer = _config["EmailSettings:SmtpServer"];
                var smtpPort = int.Parse(_config["EmailSettings:SmtpPort"] ?? "587");
                var smtpUsername = _config["EmailSettings:SmtpUsername"];
                var smtpPassword = _config["EmailSettings:SmtpPassword"];
                var adminEmail = _config["EmailSettings:AdminEmail"];

                using var client = new SmtpClient(smtpServer, smtpPort)
                {
                    Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                    EnableSsl = true
                };

                // Send to Admin
                var adminMessage = new MailMessage
                {
                    From = new MailAddress(smtpUsername!, "Clean Ninja System"),
                    Subject = $"New Booking: {booking.ServicePackage} for {booking.CustomerName}",
                    Body = $@"A new booking was just placed:
Name: {booking.CustomerName}
Email: {booking.CustomerEmail}
Phone: {booking.Phone}
Address: {booking.Address}
Service: {booking.ServicePackage}
Frequency: {booking.Frequency} x{booking.FrequencyCount}
Date/Time: {booking.ScheduledDate?.ToString("f") ?? "Not specified"} ({booking.TimeSlotLabel})",
                    IsBodyHtml = false
                };
                adminMessage.To.Add(adminEmail!);
                await client.SendMailAsync(adminMessage);

                // Send to Customer (Beautiful Template)
                if (!string.IsNullOrEmpty(booking.CustomerEmail))
                {
                    var customerMessage = new MailMessage
                    {
                        From = new MailAddress(smtpUsername!, "Clean Ninja"),
                        Subject = "Your Clean Ninja Booking Confirmation",
                        Body = GetCustomerEmailTemplate(booking),
                        IsBodyHtml = true
                    };
                    customerMessage.To.Add(booking.CustomerEmail);
                    await client.SendMailAsync(customerMessage);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending booking confirmation emails");
            }
        }

        public async Task SendContactInquiryAsync(ContactRequest request)
        {
            try
            {
                var smtpServer = _config["EmailSettings:SmtpServer"];
                var smtpPort = int.Parse(_config["EmailSettings:SmtpPort"] ?? "587");
                var smtpUsername = _config["EmailSettings:SmtpUsername"];
                var smtpPassword = _config["EmailSettings:SmtpPassword"];
                var adminEmail = _config["EmailSettings:AdminEmail"];

                using var client = new SmtpClient(smtpServer, smtpPort)
                {
                    Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                    EnableSsl = true
                };

                var adminMessage = new MailMessage
                {
                    From = new MailAddress(smtpUsername!, "Clean Ninja System"),
                    Subject = $"New Contact Inquiry from {request.Name}",
                    Body = $@"A new inquiry was submitted via the contact form:

Name: {request.Name}
Phone: {request.Phone}

Message:
{request.Message}",
                    IsBodyHtml = false
                };
                adminMessage.To.Add(adminEmail!);
                await client.SendMailAsync(adminMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending contact inquiry email");
            }
        }

        private string GetCustomerEmailTemplate(Booking booking)
        {
            var scheduledInfo = booking.ScheduledDate.HasValue 
                ? $"<strong>Date:</strong> {booking.ScheduledDate.Value.ToString("D")}<br><strong>Time:</strong> {booking.TimeSlotLabel}" 
                : "<strong>Schedule:</strong> To be confirmed";

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <style>
        body {{
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 0;
            color: #444444;
        }}
        .container {{
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }}
        .header {{
            background-color: #E63946;
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 28px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .content h2 {{
            color: #222222;
            margin-top: 0;
        }}
        .booking-details {{
            background-color: #f9f9f9;
            border-left: 4px solid #E63946;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }}
        .booking-details p {{
            margin: 10px 0;
            font-size: 15px;
        }}
        .footer {{
            background-color: #222222;
            color: #eeeeee;
            text-align: center;
            padding: 20px;
            font-size: 13px;
        }}
        .btn {{
            display: inline-block;
            background-color: #E63946;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 25px;
            border-radius: 50px;
            font-weight: bold;
            margin-top: 20px;
            text-transform: uppercase;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <img src=""https://cleanninja.uk/assets/images/CleanNinjaWB.webp"" alt=""Clean Ninja"" style=""max-height: 80px; margin-bottom: 15px; border-radius: 8px;"">
            <h1>Clean Ninja</h1>
            <p style=""margin: 10px 0 0 0; opacity: 0.9;"">Booking Confirmed</p>
        </div>
        <div class=""content"">
            <h2>Hi {booking.CustomerName.Split(' ')[0]},</h2>
            <p>Thank you for choosing Clean Ninja! We have successfully received your booking request. Our team will contact you shortly to finalize the details.</p>
            
            <div class=""booking-details"">
                <p><strong>Service:</strong> {booking.ServicePackage}</p>
                <p>{scheduledInfo}</p>
                <p><strong>Address:</strong> {booking.Address}</p>
            </div>
            
            <p>If you have any questions or need to make changes, please don't hesitate to reach out to us.</p>
            
            <center>
                <a href=""https://cleanninja.uk"" class=""btn"" style=""color: #ffffff;"">Visit Website</a>
            </center>
        </div>
        <div class=""footer"">
            <p>&copy; {DateTime.UtcNow.Year} Clean Ninja Liverpool. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}
