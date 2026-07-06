// ============================================================
// SERVICE: BloodRequestService
// Business logic layer between Controller and Repository
// ============================================================
using LifeLink.API.Interfaces;
using LifeLink.API.Models;

namespace LifeLink.API.Services
{
    public class BloodRequestService
    {
        private readonly IBloodRequestRepository _repo;
        private readonly IHospitalRepository     _hospitalRepo;

        public BloodRequestService(
            IBloodRequestRepository repo,
            IHospitalRepository hospitalRepo)
        {
            _repo         = repo;
            _hospitalRepo = hospitalRepo;
        }

        // Get all blood requests
        public async Task<IEnumerable<BloodRequest>> GetAllRequestsAsync()
        {
            return await _repo.GetAllAsync();
        }

        // Get requests for a specific hospital
        public async Task<IEnumerable<BloodRequest>> GetByHospitalAsync(int hospitalId)
        {
            return await _repo.GetByHospitalIdAsync(hospitalId);
        }

        // Submit a new blood request — validates hospital existence first
        public async Task<(bool Success, string Message)> SubmitRequestAsync(BloodRequest request)
        {
            // Validate that the hospital exists
            var hospital = await _hospitalRepo.GetByIdAsync(request.HospitalId);
            if (hospital == null)
                return (false, "Hospital not found.");

            if (string.IsNullOrWhiteSpace(request.PatientName))
                return (false, "Patient name is required.");

            if (string.IsNullOrWhiteSpace(request.BloodGroup))
                return (false, "Blood group is required.");

            request.RequestDate = DateTime.UtcNow;
            request.Status      = "Pending";

            await _repo.AddAsync(request);
            return (true, "Blood request submitted. Hospital staff will follow up shortly.");
        }

        // Update status (Pending → Fulfilled / Cancelled)
        public async Task<(bool Success, string Message)> UpdateStatusAsync(int id, string status)
        {
            var allowedStatuses = new[] { "Pending", "Fulfilled", "Cancelled" };
            if (!allowedStatuses.Contains(status))
                return (false, "Invalid status. Use: Pending, Fulfilled, or Cancelled.");

            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return (false, "Blood request not found.");

            await _repo.UpdateStatusAsync(id, status);
            return (true, $"Request status updated to '{status}'.");
        }

        // Delete a request
        public async Task<(bool Success, string Message)> DeleteRequestAsync(int id)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return (false, "Blood request not found.");

            await _repo.DeleteAsync(id);
            return (true, "Blood request deleted.");
        }
    }
}
