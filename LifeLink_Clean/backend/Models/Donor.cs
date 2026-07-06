// ============================================================
// MODEL: Donor — Stores donor-specific blood donation info
// OOP: Encapsulation — eligibility logic is encapsulated here
// ============================================================
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LifeLink.API.Models
{
    public class Donor
    {
        public int Id { get; set; }

        // Foreign key linking to User table
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        [Required, MaxLength(5)]
        public string BloodGroup { get; set; } = string.Empty; // e.g. "A+", "O-"

        [Required, MaxLength(100)]
        public string City { get; set; } = string.Empty;

        // Date of last blood donation (null = first-time donor)
        public DateTime? LastDonationDate { get; set; }

        // Denormalized status stored in DB for quick queries
        // Values: "Eligible" or "Waiting" (updated by eligibility logic)
        [MaxLength(20)]
        public string EligibilityStatus { get; set; } = "Eligible";

        // Donor's contact phone number
        [MaxLength(20)]
        public string ContactNumber { get; set; } = string.Empty;

        // Donor's age (must be 18-65 to donate blood)
        public int Age { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ─── SMART ELIGIBILITY LOGIC ──────────────────────────
        // Computed property: checks the 90-day (3-month) rule
        // Not mapped to database — calculated at runtime
        [NotMapped]
        public bool IsEligible =>
            LastDonationDate == null ||
            (DateTime.UtcNow - LastDonationDate.Value).TotalDays >= 90;

        // Returns "Eligible" or "Waiting" based on last donation date
        [NotMapped]
        public string ComputedStatus => IsEligible ? "Eligible" : "Waiting";
    }
}
