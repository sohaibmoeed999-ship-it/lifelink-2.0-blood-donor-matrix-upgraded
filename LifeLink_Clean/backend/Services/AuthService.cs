// ============================================================
// SERVICE: AuthService
// Handles user registration, login, and JWT token generation
// ============================================================
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using LifeLink.API.DTOs;
using LifeLink.API.Interfaces;
using LifeLink.API.Models;

namespace LifeLink.API.Services
{
    public class AuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IConfiguration _config;

        public AuthService(IUserRepository userRepo, IConfiguration config)
        {
            _userRepo = userRepo;
            _config = config;
        }

        /// <summary>
        /// Hash password using SHA-256.
        /// Note: In production, use BCrypt or Argon2 instead.
        /// SHA-256 is used here for simplicity and demonstration.
        /// </summary>
        private static string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        /// <summary>
        /// Register a new user account.
        /// Validates: duplicate email, then creates user with hashed password.
        /// </summary>
        public async Task<(bool Success, string Message)> RegisterAsync(RegisterDto dto)
        {
            // Check if email already exists
            if (await _userRepo.ExistsAsync(dto.Email))
                return (false, "An account with this email already exists.");

            var user = new User
            {
                Name = dto.Name.Trim(),
                Email = dto.Email.Trim().ToLower(),
                PasswordHash = HashPassword(dto.Password),
                Role = dto.Role == "Admin" ? "Admin" : "User" // Default to User
            };

            await _userRepo.AddAsync(user);
            return (true, "Account created successfully! You can now sign in.");
        }

        /// <summary>
        /// Authenticate user and return JWT token + user info.
        /// Returns null if credentials are invalid.
        /// </summary>
        public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
        {
            var user = await _userRepo.GetByEmailAsync(dto.Email.Trim());

            // Verify user exists and password matches
            if (user == null || user.PasswordHash != HashPassword(dto.Password))
                return null;

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                UserId = user.Id
            };
        }

        /// <summary>
        /// Generate a JWT token containing user claims.
        /// Token is valid for 7 days.
        /// Claims included: user ID, email, role, name.
        /// </summary>
        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(ClaimTypes.Name, user.Name),
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
