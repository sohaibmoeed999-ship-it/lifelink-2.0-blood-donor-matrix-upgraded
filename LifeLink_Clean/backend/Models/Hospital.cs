// ============================================================
// MODEL: Hospital — Partner hospital directory
// ============================================================
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LifeLink.API.Models
{
    public class Hospital
    {
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string City { get; set; } = string.Empty;

        // Comma-separated blood types available at this hospital
        // e.g. "A+,O-,B+"
        [MaxLength(100)]
        public string BloodAvailability { get; set; } = string.Empty;

        // Navigation: blood requests linked to this hospital
        public List<BloodRequest> BloodRequests { get; set; } = new();

        // ─── COMPUTED PROPERTIES (not stored in DB) ─────────────
        // Parsed array of available blood types — used by React frontend
        [NotMapped]
        public string[] BloodAvailable =>
            string.IsNullOrWhiteSpace(BloodAvailability)
                ? Array.Empty<string>()
                : BloodAvailability.Split(',', StringSplitOptions.RemoveEmptyEntries);

        // Request counts for the hospital card display
        [NotMapped]
        public int TotalRequests => BloodRequests.Count;

        [NotMapped]
        public int PendingRequests => BloodRequests.Count(r => r.Status == "Pending");
    }
}
