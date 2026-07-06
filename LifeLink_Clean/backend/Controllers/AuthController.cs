// ============================================================
// CONTROLLER: AuthController
// Endpoints: POST /api/auth/register, POST /api/auth/login
// ============================================================
using Microsoft.AspNetCore.Mvc;
using LifeLink.API.DTOs;
using LifeLink.API.Services;

namespace LifeLink.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        // POST /api/auth/register — Create a new user account
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var (success, message) = await _authService.RegisterAsync(dto);
            if (!success)
                return BadRequest(new { message });

            return Ok(new { message });
        }

        // POST /api/auth/login — Authenticate and get JWT token
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(dto);
            if (result == null)
                return Unauthorized(new { message = "Invalid email or password." });

            return Ok(result);
        }
    }
}
