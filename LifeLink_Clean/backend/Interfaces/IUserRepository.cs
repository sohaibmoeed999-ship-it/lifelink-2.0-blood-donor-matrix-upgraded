// ============================================================
// INTERFACE: IUserRepository
// OOP: Abstraction — defines contract for user data access
// ============================================================
using LifeLink.API.Models;

namespace LifeLink.API.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(int id);
        Task<IEnumerable<User>> GetAllAsync();
        Task AddAsync(User user);
        Task<bool> ExistsAsync(string email);
    }
}
