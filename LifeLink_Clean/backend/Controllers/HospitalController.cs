// ============================================================
// CONTROLLER: HospitalController
// Endpoints:
//   GET    /api/hospital           — List all hospitals
//   GET    /api/hospital/{id}      — Get hospital by ID
//   POST   /api/hospital/request   — Submit blood request
//   POST   /api/hospital           — Add hospital (Admin)
//   PUT    /api/hospital/{id}      — Update hospital (Admin)
//   DELETE /api/hospital/{id}      — Delete hospital (Admin)
// ============================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LifeLink.API.DTOs;
using LifeLink.API.Models;
using LifeLink.API.Services;

namespace LifeLink.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HospitalController : ControllerBase
    {
        private readonly HospitalService     _hospitalService;
        private readonly BloodRequestService _requestService;

        public HospitalController(
            HospitalService hospitalService,
            BloodRequestService requestService)
        {
            _hospitalService = hospitalService;
            _requestService  = requestService;
        }

        // GET /api/hospital — List all partner hospitals with blood availability
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var hospitals = await _hospitalService.GetAllHospitalsAsync();
            return Ok(hospitals);
        }

        // GET /api/hospital/{id} — Get a single hospital by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var hospital = await _hospitalService.GetHospitalByIdAsync(id);
            if (hospital == null)
                return NotFound(new { message = "Hospital not found." });

            return Ok(hospital);
        }

        // POST /api/hospital/request — Submit a blood request for a patient
        [HttpPost("request")]
        public async Task<IActionResult> SubmitRequest([FromBody] BloodRequestDto dto)
        {
            var request = new BloodRequest
            {
                PatientName = dto.PatientName,
                BloodGroup  = dto.BloodGroup,
                HospitalId  = dto.HospitalId
            };

            var (success, message) = await _requestService.SubmitRequestAsync(request);

            if (!success)
                return BadRequest(new { message });

            return Ok(new { message });
        }

        // POST /api/hospital — Add a new hospital (Admin only)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Add([FromBody] Hospital hospital)
        {
            var (success, message) = await _hospitalService.AddHospitalAsync(hospital);

            if (!success)
                return BadRequest(new { message });

            return Ok(new { message });
        }

        // PUT /api/hospital/{id} — Update hospital info (Admin only)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Hospital hospital)
        {
            hospital.Id = id;
            var (success, message) = await _hospitalService.UpdateHospitalAsync(hospital);

            if (!success)
                return NotFound(new { message });

            return Ok(new { message });
        }

        // DELETE /api/hospital/{id} — Delete a hospital (Admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var (success, message) = await _hospitalService.DeleteHospitalAsync(id);

            if (!success)
                return NotFound(new { message });

            return Ok(new { message });
        }
    }
}
