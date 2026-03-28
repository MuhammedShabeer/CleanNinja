using System.Text.Json.Serialization;

namespace CleanNinja.Server.Models
{
    public class ServiceMedia
    {
        public int Id { get; set; }
        public int ServiceId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileType { get; set; } = "image"; // "image" or "video"
        public string Url { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [JsonIgnore]
        public Service? Service { get; set; }
    }
}
