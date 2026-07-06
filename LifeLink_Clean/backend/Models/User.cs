// ============================================================
// MODEL: User — Represents a registered user of the system
// OOP: Encapsulation — properties encapsulate user data
// ============================================================
using System.ComponentModel.DataAnnotations;

namespace LifeLink.API.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        // Role: "User" or "Admin"
        [MaxLength(20)]
        public string Role { get; set; } = "User";

        // Navigation: one user can be one donor
        public Donor? Donor { get; set; }

        // Navigation: one user can have many reviews
        public List<Review> Reviews { get; set; } = new();
    }
}
