// ============================================================
// REPOSITORY: ReviewRepository
// OOP: Polymorphism — implements IReviewRepository interface
// Handles all database operations for Reviews
// ============================================================
using Microsoft.EntityFrameworkCore;
using LifeLink.API.Data;
using LifeLink.API.Interfaces;
using LifeLink.API.Models;

namespace LifeLink.API.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly AppDbContext _context;

        public ReviewRepository(AppDbContext context)
        {
            _context = context;
        }

        // Get all reviews, newest first, include user name
        public async Task<IEnumerable<Review>> GetAllAsync()
        {
            return await _context.Reviews
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        // Get a single review by ID
        public async Task<Review?> GetByIdAsync(int id)
        {
            return await _context.Reviews
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        // Add a new review
        public async Task AddAsync(Review review)
        {
            await _context.Reviews.AddAsync(review);
            await _context.SaveChangesAsync();
        }

        // Delete a review by ID (Admin action)
        public async Task DeleteAsync(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review != null)
            {
                _context.Reviews.Remove(review);
                await _context.SaveChangesAsync();
            }
        }
    }
}
