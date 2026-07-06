// ============================================================
// INTERFACE: IDonorRepository
// OOP: Abstraction — defines contract without implementation
// ============================================================
using LifeLink.API.Models;

namespace LifeLink.API.Interfaces
{
    public interface IDonorRepository
    {
        Task<IEnumerable<Donor>> GetAllAsync();
        Task<Donor?> GetByIdAsync(int id);
        Task<Donor?> GetByUserIdAsync(int userId);
        Task<IEnumerable<Donor>> SearchAsync(string bloodGroup, string? city);
        Task AddAsync(Donor donor);
        Task UpdateAsync(Donor donor);
        Task DeleteAsync(int id);
    }
}
