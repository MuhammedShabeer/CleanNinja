namespace CleanNinja.Server.Models
{
    public class SiteContent
    {
        public int Id { get; set; }
        public required string Section { get; set; } // e.g., "LandingPage", "Pricing"
        public required string Key { get; set; }     // e.g., "Tagline"
        public required string Value { get; set; }   // JSON string or plain text
    }
}
