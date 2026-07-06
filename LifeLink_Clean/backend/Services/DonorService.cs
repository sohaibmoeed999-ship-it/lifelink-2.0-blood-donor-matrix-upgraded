// ============================================================
// SERVICE: DonorService
// Business logic layer — sits between Controller and Repository
// Handles validation, eligibility checks, and smart search
// ============================================================
using LifeLink.API.DTOs;
using LifeLink.API.Helpers;
using LifeLink.API.Interfaces;
using LifeLink.API.Models;

namespace LifeLink.API.Services
{
    public class DonorService
    {
        private readonly IDonorRepository _repo;

        public DonorService(IDonorRepository repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Register a new donor with full validation:
        /// 1. Valid blood group check
        /// 2. 3-month (90-day) eligibility rule
        /// 3. Duplicate donor check
        /// </summary>
        public async Task<(bool Success, string Message)> RegisterDonorAsync(CreateDonorDto dto, int userId)
        {
            // Check if user is already registered as a donor
            var existing = await _repo.GetByUserIdAsync(userId);
            if (existing != null)
                return (false, "You are already registered as a donor.");

            // Validate blood group
            if (!BloodCompatibility.IsValidBloodGroup(dto.BloodGroup))
                return (false, "Invalid blood group. Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-");

            // Check the 3-month eligibility rule
            if (dto.LastDonationDate.HasValue)
            {
                var daysSince = (DateTime.UtcNow - dto.LastDonationDate.Value).TotalDays;
                if (daysSince < 90)
                    return (false, $"Must wait {(int)(90 - daysSince)} more days before donating again.");
            }

            // Create and save donor record
            var donor = new Donor
            {
                UserId            = userId,
                BloodGroup        = dto.BloodGroup.Trim(),
                City              = dto.City.Trim(),
                LastDonationDate  = dto.LastDonationDate,
                EligibilityStatus = "Eligible",
                ContactNumber     = dto.ContactNumber.Trim(),
                Age               = dto.Age,
                CreatedAt         = DateTime.UtcNow
            };

            await _repo.AddAsync(donor);
            return (true, "Donor registered successfully! Thank you for saving lives.");
        }

        /// <summary>
        /// Smart search: find and rank compatible donors using the scoring algorithm.
        /// Only eligible donors are returned, sorted by match score (highest first).
        /// </summary>
        public async Task<List<DonorResultDto>> SmartSearchAsync(string bloodGroup, string city)
        {
            var donors = await _repo.SearchAsync(bloodGroup, string.IsNullOrWhiteSpace(city) ? null : city);

            var results = donors
                .Select(d => new DonorResultDto
                {
                    Id = d.Id,
                    Name = d.User.Name,
                    BloodGroup = d.BloodGroup,
                    City = d.City,
                    IsEligible = d.IsEligible,
                    EligibilityStatus = d.ComputedStatus,
                    Contact = string.IsNullOrWhiteSpace(d.ContactNumber) ? d.User.Email : d.ContactNumber,
                    LastDonationDate = d.LastDonationDate?.ToString("yyyy-MM-dd"),
                    // Calculate the smart match score
                    Score = BloodCompatibility.CalculateScore(
                        d.BloodGroup, bloodGroup, d.City, city ?? "")
                })
                .Where(d => d.IsEligible) // Only show eligible donors
                .OrderByDescending(d => d.Score) // Best match first
                .ToList();

            return results;
        }

        /// <summary>
        /// Get all donors as DTOs for admin listing.
        /// </summary>
        public async Task<List<DonorListDto>> GetAllDonorsAsync()
        {
            var donors = await _repo.GetAllAsync();
            return donors.Select(d => new DonorListDto
            {
                Id                = d.Id,
                Name              = d.User.Name,
                Email             = d.User.Email,
                BloodGroup        = d.BloodGroup,
                City              = d.City,
                ContactNumber     = d.ContactNumber,
                Age               = d.Age,
                IsEligible        = d.IsEligible,
                EligibilityStatus = d.ComputedStatus,
                LastDonationDate  = d.LastDonationDate?.ToString("yyyy-MM-dd"),
                CreatedAt         = d.CreatedAt.ToString("yyyy-MM-dd")
            }).ToList();
        }
    }
}
