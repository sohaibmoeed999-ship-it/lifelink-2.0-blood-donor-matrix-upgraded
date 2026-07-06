// ============================================================
// SERVICE: ReviewService
// Business logic layer between Controller and Repository
// ============================================================
using LifeLink.API.Interfaces;
using LifeLink.API.Models;

namespace LifeLink.API.Services
{
    public class ReviewService
    {
        private readonly IReviewRepository _repo;

        public ReviewService(IReviewRepository repo)
        {
            _repo = repo;
        }

        // Get all reviews (with user names)
        public async Task<IEnumerable<Review>> GetAllReviewsAsync()
        {
            return await _repo.GetAllAsync();
        }

        // Add a new review — validates rating range and comment
        public async Task<(bool Success, string Message)> AddReviewAsync(Review review)
        {
            if (review.Rating < 1 || review.Rating > 5)
                return (false, "Rating must be between 1 and 5.");

            if (string.IsNullOrWhiteSpace(review.Comment))
                return (false, "Comment cannot be empty.");

            review.CreatedAt = DateTime.UtcNow;

            await _repo.AddAsync(review);
            return (true, "Thank you for your feedback!");
        }

        // Delete a review (Admin action)
        public async Task<(bool Success, string Message)> DeleteReviewAsync(int id)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return (false, "Review not found.");

            await _repo.DeleteAsync(id);
            return (true, "Review deleted.");
        }
    }
}
