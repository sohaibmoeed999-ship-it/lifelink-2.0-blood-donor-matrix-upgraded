// ============================================================
// REPOSITORY: HospitalRepository
// OOP: Polymorphism — implements IHospitalRepository interface
// Handles all database operations for Hospitals
// ============================================================
using Microsoft.EntityFrameworkCore;
using LifeLink.API.Data;
using LifeLink.API.Interfaces;
using LifeLink.API.Models;

namespace LifeLink.API.Repositories
{
    public class HospitalRepository : IHospitalRepository
    {
        private readonly AppDbContext _context;

        // Constructor injection (Dependency Injection pattern)
        public HospitalRepository(AppDbContext context)
        {
            _context = context;
        }

        // Get all hospitals with their related BloodRequests
        public async Task<IEnumerable<Hospital>> GetAllAsync()
        {
            return await _context.Hospitals
                .Include(h => h.BloodRequests)
                .OrderBy(h => h.Name)
                .ToListAsync();
        }

        // Get a single hospital by ID
        public async Task<Hospital?> GetByIdAsync(int id)
        {
            return await _context.Hospitals
                .Include(h => h.BloodRequests)
                .FirstOrDefaultAsync(h => h.Id == id);
        }

        // Add a new hospital
        public async Task AddAsync(Hospital hospital)
        {
            await _context.Hospitals.AddAsync(hospital);
            await _context.SaveChangesAsync();
        }

        // Update an existing hospital record
        public async Task UpdateAsync(Hospital hospital)
        {
            _context.Hospitals.Update(hospital);
            await _context.SaveChangesAsync();
        }

        // Delete a hospital by ID
        public async Task DeleteAsync(int id)
        {
            var hospital = await _context.Hospitals.FindAsync(id);
            if (hospital != null)
            {
                _context.Hospitals.Remove(hospital);
                await _context.SaveChangesAsync();
            }
        }
    }
}
