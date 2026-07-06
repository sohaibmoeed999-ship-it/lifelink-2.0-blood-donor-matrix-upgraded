// ============================================================
// REPOSITORY: DonorRepository
// OOP: Polymorphism — implements IDonorRepository interface
// Handles all database operations for Donors
// ============================================================
using Microsoft.EntityFrameworkCore;
using LifeLink.API.Data;
using LifeLink.API.Interfaces;
using LifeLink.API.Models;
using LifeLink.API.Helpers;

namespace LifeLink.API.Repositories
{
    public class DonorRepository : IDonorRepository
    {
        private readonly AppDbContext _context;

        // Constructor injection (Dependency Injection pattern)
        public DonorRepository(AppDbContext context)
        {
            _context = context;
        }

        // Get all donors with their User data loaded
        public async Task<IEnumerable<Donor>> GetAllAsync()
        {
            return await _context.Donors
                .Include(d => d.User)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        // Get a single donor by ID
        public async Task<Donor?> GetByIdAsync(int id)
        {
            return await _context.Donors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        // Get donor by their user ID
        public async Task<Donor?> GetByUserIdAsync(int userId)
        {
            return await _context.Donors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.UserId == userId);
        }

        // Search donors by blood group compatibility and optional city
        public async Task<IEnumerable<Donor>> SearchAsync(string bloodGroup, string? city)
        {
            // Get all compatible blood types for the required group
            var compatible = BloodCompatibility.GetCompatibleDonors(bloodGroup);

            var query = _context.Donors
                .Include(d => d.User)
                .Where(d => compatible.Contains(d.BloodGroup));

            // Filter by city if provided
            if (!string.IsNullOrWhiteSpace(city))
            {
                query = query.Where(d => d.City.ToLower() == city.ToLower());
            }

            return await query.ToListAsync();
        }

        // Add a new donor record
        public async Task AddAsync(Donor donor)
        {
            await _context.Donors.AddAsync(donor);
            await _context.SaveChangesAsync();
        }

        // Update an existing donor
        public async Task UpdateAsync(Donor donor)
        {
            _context.Donors.Update(donor);
            await _context.SaveChangesAsync();
        }

        // Delete a donor by ID
        public async Task DeleteAsync(int id)
        {
            var donor = await _context.Donors.FindAsync(id);
            if (donor != null)
            {
                _context.Donors.Remove(donor);
                await _context.SaveChangesAsync();
            }
        }
    }
}
