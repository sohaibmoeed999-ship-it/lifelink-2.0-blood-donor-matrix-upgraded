// ============================================================
// INTERFACE: IHospitalRepository
// Defines the contract for Hospital data operations
// OOP: Abstraction — consumer doesn't know HOW, just WHAT
// ============================================================
using LifeLink.API.Models;

namespace LifeLink.API.Interfaces
{
    public interface IHospitalRepository
    {
        Task<IEnumerable<Hospital>> GetAllAsync();
        Task<Hospital?> GetByIdAsync(int id);
        Task AddAsync(Hospital hospital);
        Task UpdateAsync(Hospital hospital);
        Task DeleteAsync(int id);
    }
}
