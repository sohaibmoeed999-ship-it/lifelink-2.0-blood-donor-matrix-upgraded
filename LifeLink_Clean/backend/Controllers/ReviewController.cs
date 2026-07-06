// ============================================================
// CONTROLLER: ReviewController
// Endpoints:
//   GET    /api/review       — Get all reviews (public)
//   POST   /api/review       — Submit a review (authenticated)
//   DELETE /api/review/{id}  — Delete a review (Admin only)
// ============================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LifeLink.API.DTOs;
using LifeLink.API.Models;
using LifeLink.API.Services;

namespace LifeLink.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly ReviewService _service;

        public ReviewController(ReviewService service)
        {
            _service = service;
        }

        // GET /api/review — Get all reviews (public endpoint)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reviews = await _service.GetAllReviewsAsync();

            // Map to ReviewDto to avoid exposing full User object
            var result = reviews.Select(r => new ReviewDto
            {
                Id        = r.Id,
                UserName  = r.User.Name,
                Rating    = r.Rating,
                Comment   = r.Comment,
                CreatedAt = r.CreatedAt.ToString("yyyy-MM-dd")
            });

            return Ok(result);
        }

        // POST /api/review — Submit a new review (must be logged in)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Add([FromBody] Review review)
        {
            // Extract user ID from JWT token claims
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized(new { message = "Invalid token." });

            review.UserId = int.Parse(userIdClaim.Value);

            var (success, message) = await _service.AddReviewAsync(review);

            if (!success)
                return BadRequest(new { message });

            return Ok(new { message });
        }

        // DELETE /api/review/{id} — Delete a review (Admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var (success, message) = await _service.DeleteReviewAsync(id);

            if (!success)
                return NotFound(new { message });

            return Ok(new { message });
        }
    }
}
