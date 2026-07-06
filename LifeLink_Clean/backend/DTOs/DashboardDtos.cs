// ============================================================
// DTOs: Dashboard data transfer objects for admin charts
// ============================================================
namespace LifeLink.API.DTOs
{
    // Stats overview for metric cards
    public class DashboardStatsDto
    {
        public int TotalDonors { get; set; }
        public int EligibleDonors { get; set; }
        public int TotalHospitals { get; set; }
        public int CitiesCovered { get; set; }
        public int TotalRequests { get; set; }
        public int PendingRequests { get; set; }
        public int TotalReviews { get; set; }
    }

    // Blood group distribution for chart
    public class BloodGroupCountDto
    {
        public string BloodGroup { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    // City distribution for chart
    public class CityCountDto
    {
        public string City { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    // Monthly registration data for chart
    public class MonthlyCountDto
    {
        public string Month { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    // Review DTO for display
    public class ReviewDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }

    // Blood request DTO
    public class BloodRequestDto
    {
        public string PatientName { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public int HospitalId { get; set; }
    }
}
