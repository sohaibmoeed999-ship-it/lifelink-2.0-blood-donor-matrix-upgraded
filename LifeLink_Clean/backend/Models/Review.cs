// ============================================================
// MODEL: Review — User feedback and ratings
// ============================================================
using System.ComponentModel.DataAnnotations;

namespace LifeLink.API.Models
{
    public class Review
    {
        public int Id { get; set; }

        // Foreign key to User
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        // Rating between 1 and 5
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
