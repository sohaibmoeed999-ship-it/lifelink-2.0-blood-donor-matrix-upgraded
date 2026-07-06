// ============================================================
// REPOSITORY: UserRepository
// OOP: Polymorphism — implements IUserRepository interface
// ============================================================
using Microsoft.EntityFrameworkCore;
using LifeLink.API.Data;
using LifeLink.API.Interfaces;
using LifeLink.API.Models;

namespace LifeLink.API.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        // Find user by email (for login)
        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        // Find user by ID
        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        // Get all users
        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }

        // Add a new user
        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        // Check if email already exists (prevent duplicates)
        public async Task<bool> ExistsAsync(string email)
        {
            return await _context.Users
                .AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }
    }
}
