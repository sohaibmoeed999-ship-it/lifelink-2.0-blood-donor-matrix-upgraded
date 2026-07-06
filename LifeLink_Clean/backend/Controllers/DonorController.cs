// ============================================================
// CONTROLLER: DonorController
// Endpoints: GET /api/donor, POST /api/donor, GET /api/donor/search
// ============================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LifeLink.API.DTOs;
using LifeLink.API.Services;

namespace LifeLink.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonorController : ControllerBase
    {
        private readonly DonorService _service;

        public DonorController(DonorService service)
        {
            _service = service;
        }

        // GET /api/donor — Get all donors (Admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var donors = await _service.GetAllDonorsAsync();
            return Ok(donors);
        }

        // POST /api/donor — Register current user as a donor
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Register([FromBody] CreateDonorDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Get current user ID from JWT token claims
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized(new { message = "Invalid token." });

            var userId = int.Parse(userIdClaim.Value);
            var (success, message) = await _service.RegisterDonorAsync(dto, userId);

            if (!success)
                return BadRequest(new { message });

            return Ok(new { message });
        }

        // GET /api/donor/search?bloodGroup=A+&city=Lahore — Smart donor search
        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] string bloodGroup,
            [FromQuery] string? city = "")
        {
            if (string.IsNullOrWhiteSpace(bloodGroup))
                return BadRequest(new { message = "Blood group is required." });

            var results = await _service.SmartSearchAsync(bloodGroup, city ?? "");
            return Ok(results);
        }
    }
}
