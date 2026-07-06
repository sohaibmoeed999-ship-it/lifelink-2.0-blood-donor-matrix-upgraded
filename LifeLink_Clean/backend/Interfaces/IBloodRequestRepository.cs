// ============================================================
// INTERFACE: IBloodRequestRepository
// Defines the contract for BloodRequest data operations
// ============================================================
using LifeLink.API.Models;

namespace LifeLink.API.Interfaces
{
    public interface IBloodRequestRepository
    {
        Task<IEnumerable<BloodRequest>> GetAllAsync();
        Task<BloodRequest?> GetByIdAsync(int id);
        Task<IEnumerable<BloodRequest>> GetByHospitalIdAsync(int hospitalId);
        Task AddAsync(BloodRequest request);
        Task UpdateStatusAsync(int id, string status);
        Task DeleteAsync(int id);
    }
}
