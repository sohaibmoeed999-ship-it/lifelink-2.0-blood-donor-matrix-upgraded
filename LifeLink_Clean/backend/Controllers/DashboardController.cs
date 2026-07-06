// ============================================================
// CONTROLLER: DashboardController
// Admin-only endpoints providing data for all 4 dashboard charts
// Endpoints: GET /api/dashboard/stats, /bloodgroups, /cities, /monthly
// ============================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LifeLink.API.Data;
using LifeLink.API.DTOs;

namespace LifeLink.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/dashboard/stats — Overview metrics for dashboard cards
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var donors = await _context.Donors.ToListAsync();
            var stats = new DashboardStatsDto
            {
                TotalDonors = donors.Count,
                // Use the computed property for real-time eligibility
                EligibleDonors = donors.Count(d =>
                    d.LastDonationDate == null ||
                    (DateTime.UtcNow - d.LastDonationDate.Value).TotalDays >= 90),
                TotalHospitals = await _context.Hospitals.CountAsync(),
                CitiesCovered = await _context.Donors.Select(d => d.City).Distinct().CountAsync(),
                TotalRequests = await _context.BloodRequests.CountAsync(),
                PendingRequests = await _context.BloodRequests.CountAsync(r => r.Status == "Pending"),
                TotalReviews = await _context.Reviews.CountAsync()
            };

            return Ok(stats);
        }

        // GET /api/dashboard/bloodgroups — Chart 1: Blood group distribution
        [HttpGet("bloodgroups")]
        public async Task<IActionResult> GetBloodGroupDistribution()
        {
            var data = await _context.Donors
                .GroupBy(d => d.BloodGroup)
                .Select(g => new BloodGroupCountDto
                {
                    BloodGroup = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .ToListAsync();

            return Ok(data);
        }

        // GET /api/dashboard/cities — Chart 2: Donors per city
        [HttpGet("cities")]
        public async Task<IActionResult> GetCityDistribution()
        {
            var data = await _context.Donors
                .GroupBy(d => d.City)
                .Select(g => new CityCountDto
                {
                    City = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .ToListAsync();

            return Ok(data);
        }

        // GET /api/dashboard/monthly — Chart 3: Monthly donor registrations
        [HttpGet("monthly")]
        public async Task<IActionResult> GetMonthlyRegistrations()
        {
            var data = await _context.Donors
                .GroupBy(d => new { d.CreatedAt.Year, d.CreatedAt.Month })
                .Select(g => new MonthlyCountDto
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Count = g.Count()
                })
                .OrderBy(x => x.Month)
                .ToListAsync();

            return Ok(data);
        }

        // GET /api/dashboard/donors — Full donor list for admin table
        [HttpGet("donors")]
        public async Task<IActionResult> GetAllDonors()
        {
            var donors = await _context.Donors
                .Include(d => d.User)
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new DonorListDto
                {
                    Id = d.Id,
                    Name = d.User.Name,
                    Email = d.User.Email,
                    BloodGroup = d.BloodGroup,
                    City = d.City,
                    IsEligible = d.LastDonationDate == null ||
                        (DateTime.UtcNow - d.LastDonationDate.Value).TotalDays >= 90,
                    EligibilityStatus = (d.LastDonationDate == null ||
                        (DateTime.UtcNow - d.LastDonationDate.Value).TotalDays >= 90)
                        ? "Eligible" : "Waiting",
                    LastDonationDate = d.LastDonationDate != null
                        ? d.LastDonationDate.Value.ToString("yyyy-MM-dd") : null,
                    CreatedAt = d.CreatedAt.ToString("yyyy-MM-dd")
                })
                .ToListAsync();

            return Ok(donors);
        }
    }
}
