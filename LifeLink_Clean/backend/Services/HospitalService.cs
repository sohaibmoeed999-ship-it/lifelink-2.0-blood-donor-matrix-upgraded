// ============================================================
// SERVICE: HospitalService
// Business logic layer between Controller and Repository
// OOP: Single Responsibility — service handles hospital logic
// ============================================================
using LifeLink.API.Interfaces;
using LifeLink.API.Models;

namespace LifeLink.API.Services
{
    public class HospitalService
    {
        private readonly IHospitalRepository _repo;

        // Constructor injection — IHospitalRepository is injected by DI
        public HospitalService(IHospitalRepository repo)
        {
            _repo = repo;
        }

        // Return all hospitals
        public async Task<IEnumerable<Hospital>> GetAllHospitalsAsync()
        {
            return await _repo.GetAllAsync();
        }

        // Return one hospital by ID, null if not found
        public async Task<Hospital?> GetHospitalByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }

        // Add a new hospital (Admin only action)
        public async Task<(bool Success, string Message)> AddHospitalAsync(Hospital hospital)
        {
            if (string.IsNullOrWhiteSpace(hospital.Name) || string.IsNullOrWhiteSpace(hospital.City))
                return (false, "Hospital name and city are required.");

            await _repo.AddAsync(hospital);
            return (true, "Hospital added successfully.");
        }

        // Update an existing hospital record
        public async Task<(bool Success, string Message)> UpdateHospitalAsync(Hospital hospital)
        {
            var existing = await _repo.GetByIdAsync(hospital.Id);
            if (existing == null)
                return (false, "Hospital not found.");

            existing.Name             = hospital.Name;
            existing.City             = hospital.City;
            existing.BloodAvailability = hospital.BloodAvailability;

            await _repo.UpdateAsync(existing);
            return (true, "Hospital updated successfully.");
        }

        // Delete hospital by ID
        public async Task<(bool Success, string Message)> DeleteHospitalAsync(int id)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return (false, "Hospital not found.");

            await _repo.DeleteAsync(id);
            return (true, "Hospital deleted successfully.");
        }
    }
}
