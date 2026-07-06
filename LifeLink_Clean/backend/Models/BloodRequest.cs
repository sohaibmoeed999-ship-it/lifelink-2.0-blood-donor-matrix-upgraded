// ============================================================
// MODEL: BloodRequest — Patient blood request record
// ============================================================
using System.ComponentModel.DataAnnotations;

namespace LifeLink.API.Models
{
    public class BloodRequest
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string PatientName { get; set; } = string.Empty;

        [Required, MaxLength(5)]
        public string BloodGroup { get; set; } = string.Empty;

        // Foreign key to Hospital
        public int HospitalId { get; set; }
        public Hospital Hospital { get; set; } = null!;

        public DateTime RequestDate { get; set; } = DateTime.UtcNow;

        // Status: "Pending" or "Fulfilled"
        [MaxLength(20)]
        public string Status { get; set; } = "Pending";
    }
}
