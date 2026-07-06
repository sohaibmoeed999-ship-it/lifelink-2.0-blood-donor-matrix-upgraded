// ============================================================
// REPOSITORY: BloodRequestRepository
// OOP: Polymorphism — implements IBloodRequestRepository interface
// Handles all database operations for BloodRequests
// ============================================================
using Microsoft.EntityFrameworkCore;
using LifeLink.API.Data;
using LifeLink.API.Interfaces;
using LifeLink.API.Models;

namespace LifeLink.API.Repositories
{
    public class BloodRequestRepository : IBloodRequestRepository
    {
        private readonly AppDbContext _context;

        public BloodRequestRepository(AppDbContext context)
        {
            _context = context;
        }

        // Get all blood requests with hospital name loaded
        public async Task<IEnumerable<BloodRequest>> GetAllAsync()
        {
            return await _context.BloodRequests
                .Include(br => br.Hospital)
                .OrderByDescending(br => br.RequestDate)
                .ToListAsync();
        }

        // Get a single request by ID
        public async Task<BloodRequest?> GetByIdAsync(int id)
        {
            return await _context.BloodRequests
                .Include(br => br.Hospital)
                .FirstOrDefaultAsync(br => br.Id == id);
        }

        // Get all requests for a specific hospital
        public async Task<IEnumerable<BloodRequest>> GetByHospitalIdAsync(int hospitalId)
        {
            return await _context.BloodRequests
                .Include(br => br.Hospital)
                .Where(br => br.HospitalId == hospitalId)
                .OrderByDescending(br => br.RequestDate)
                .ToListAsync();
        }

        // Add a new blood request
        public async Task AddAsync(BloodRequest request)
        {
            await _context.BloodRequests.AddAsync(request);
            await _context.SaveChangesAsync();
        }

        // Update only the status field (Pending → Fulfilled or Cancelled)
        public async Task UpdateStatusAsync(int id, string status)
        {
            var request = await _context.BloodRequests.FindAsync(id);
            if (request != null)
            {
                request.Status = status;
                await _context.SaveChangesAsync();
            }
        }

        // Delete a request by ID
        public async Task DeleteAsync(int id)
        {
            var request = await _context.BloodRequests.FindAsync(id);
            if (request != null)
            {
                _context.BloodRequests.Remove(request);
                await _context.SaveChangesAsync();
            }
        }
    }
}
