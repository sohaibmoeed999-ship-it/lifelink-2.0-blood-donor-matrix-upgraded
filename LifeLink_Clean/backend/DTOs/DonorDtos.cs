// ============================================================
// DTOs: Donor data transfer objects
// ============================================================
using System.ComponentModel.DataAnnotations;

namespace LifeLink.API.DTOs
{
    // Request DTO for registering as a donor
    public class CreateDonorDto
    {
        [Required, MaxLength(5)]
        public string BloodGroup { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string City { get; set; } = string.Empty;

        public DateTime? LastDonationDate { get; set; }

        // Donor's phone number
        [MaxLength(20)]
        public string ContactNumber { get; set; } = string.Empty;

        // Donor's age (18–65 valid range for blood donation)
        [Range(18, 65)]
        public int Age { get; set; }
    }

    // Response DTO returned from smart search — includes computed score
    public class DonorResultDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public bool IsEligible { get; set; }
        public string EligibilityStatus { get; set; } = string.Empty;
        public int Score { get; set; } // Smart match priority score
        public string Contact { get; set; } = string.Empty;
        public string? LastDonationDate { get; set; }
    }

    // Simple donor listing DTO
    public class DonorListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
        public int Age { get; set; }
        public bool IsEligible { get; set; }
        public string EligibilityStatus { get; set; } = string.Empty;
        public string? LastDonationDate { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
    }
}
