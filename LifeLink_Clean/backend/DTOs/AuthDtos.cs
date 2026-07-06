// ============================================================
// DTOs: Authentication data transfer objects
// Used to pass data between API and client cleanly
// ============================================================
using System.ComponentModel.DataAnnotations;

namespace LifeLink.API.DTOs
{
    // Registration request
    public class RegisterDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(6)]
        public string Password { get; set; } = string.Empty;

        // Optional: "User" or "Admin" (defaults to User)
        public string? Role { get; set; }
    }

    // Login request
    public class LoginDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    // Login response with token and user info
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int UserId { get; set; }
    }
}
