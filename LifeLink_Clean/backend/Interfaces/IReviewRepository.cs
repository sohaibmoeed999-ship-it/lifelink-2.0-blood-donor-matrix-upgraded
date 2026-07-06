// ============================================================
// INTERFACE: IReviewRepository
// Defines the contract for Review data operations
// ============================================================
using LifeLink.API.Models;

namespace LifeLink.API.Interfaces
{
    public interface IReviewRepository
    {
        Task<IEnumerable<Review>> GetAllAsync();
        Task<Review?> GetByIdAsync(int id);
        Task AddAsync(Review review);
        Task DeleteAsync(int id);
    }
}
