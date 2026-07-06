// ============================================================
// DATA: AppDbContext — Entity Framework Core Database Context
// Maps C# models to SQL Server tables and seeds initial data
// ============================================================
using Microsoft.EntityFrameworkCore;
using LifeLink.API.Models;

namespace LifeLink.API.Data
{
    public class AppDbContext : DbContext
    {
        // Constructor accepts options (connection string, provider, etc.)
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // DbSets map each model class to a database table
        public DbSet<User> Users { get; set; }
        public DbSet<Donor> Donors { get; set; }
        public DbSet<Hospital> Hospitals { get; set; }
        public DbSet<BloodRequest> BloodRequests { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ─── UNIQUE CONSTRAINTS ─────────────────────────────────
            // Prevents duplicate email registrations
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // ─── RELATIONSHIPS ──────────────────────────────────────

            // User → Donor: one-to-one (each user can register as one donor)
            modelBuilder.Entity<Donor>()
                .HasOne(d => d.User)
                .WithOne(u => u.Donor)
                .HasForeignKey<Donor>(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User → Reviews: one-to-many (a user can write many reviews)
            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Hospital → BloodRequests: one-to-many (a hospital can have many requests)
            modelBuilder.Entity<BloodRequest>()
                .HasOne(br => br.Hospital)
                .WithMany(h => h.BloodRequests)
                .HasForeignKey(br => br.HospitalId)
                .OnDelete(DeleteBehavior.Cascade);

            // ─── SEED DATA ─────────────────────────────────────────
            // HasData inserts rows only if they don't exist (idempotent seeding)

            // 5 Partner Hospitals
            modelBuilder.Entity<Hospital>().HasData(
                new Hospital { Id = 1, Name = "Services Hospital",             City = "Lahore",     BloodAvailability = "A+,O+,B+,AB+" },
                new Hospital { Id = 2, Name = "Shaukat Khanum Memorial",       City = "Lahore",     BloodAvailability = "A+,O-,AB-,B+" },
                new Hospital { Id = 3, Name = "Aga Khan University Hospital",  City = "Karachi",    BloodAvailability = "O+,O-,A-,B-" },
                new Hospital { Id = 4, Name = "PIMS Hospital",                 City = "Islamabad",  BloodAvailability = "A+,B+,AB+" },
                new Hospital { Id = 5, Name = "Combined Military Hospital",    City = "Rawalpindi", BloodAvailability = "O+,A+,B+,AB+" }
            );

            // ─── USERS ─────────────────────────────────────────────
            // Passwords (SHA-256 Base64 encoded):
            //   admin123 => jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=
            //   user123  => BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1,  Name = "Admin User",      Email = "admin@lifelink.com",    PasswordHash = "jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=", Role = "Admin" },
                new User { Id = 2,  Name = "Ali Hassan",      Email = "ali@example.com",        PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 3,  Name = "Sara Khan",       Email = "sara@example.com",       PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 4,  Name = "Usman Malik",     Email = "usman@example.com",      PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 5,  Name = "Fatima Noor",     Email = "fatima@example.com",     PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 6,  Name = "Bilal Ahmed",     Email = "bilal@example.com",      PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 7,  Name = "Hina Iqbal",      Email = "hina@example.com",       PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 8,  Name = "Zain Raza",       Email = "zain@example.com",       PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 9,  Name = "Ayesha Qureshi",  Email = "ayesha@example.com",     PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 10, Name = "Kamran Baig",     Email = "kamran@example.com",     PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 11, Name = "Nadia Hussain",   Email = "nadia@example.com",      PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 12, Name = "Tariq Mehmood",   Email = "tariq@example.com",      PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 13, Name = "Sana Mirza",      Email = "sana@example.com",       PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 14, Name = "Farhan Sheikh",   Email = "farhan@example.com",     PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 15, Name = "Rabia Anwar",     Email = "rabia@example.com",      PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 16, Name = "Imran Siddiqui",  Email = "imran@example.com",      PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 17, Name = "Maira Yousuf",    Email = "maira@example.com",      PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 18, Name = "Hamza Tariq",     Email = "hamza@example.com",      PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 19, Name = "Asma Javed",      Email = "asma@example.com",       PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 20, Name = "Owais Rehman",    Email = "owais@example.com",      PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  },
                new User { Id = 21, Name = "Zara Saleem",     Email = "zara@example.com",       PasswordHash = "BPiZbadjt6lpsQKO4wB1aerzpjVIbdqyEdUSyFud+Ps=", Role = "User"  }
            );

            // ─── 20 DONORS ─────────────────────────────────────────
            // Linked to users 2-21 via UserId
            // EligibilityStatus = Eligible if LastDonationDate > 90 days ago
            modelBuilder.Entity<Donor>().HasData(
                new Donor { Id = 1,  UserId = 2,  BloodGroup = "A+",  City = "Lahore",     LastDonationDate = new DateTime(2024, 10,  1), EligibilityStatus = "Eligible", ContactNumber = "0300-1234567", Age = 25, CreatedAt = new DateTime(2025, 1, 15) },
                new Donor { Id = 2,  UserId = 3,  BloodGroup = "O-",  City = "Karachi",    LastDonationDate = new DateTime(2024,  8, 15), EligibilityStatus = "Eligible", ContactNumber = "0311-2345678", Age = 30, CreatedAt = new DateTime(2025, 1, 20) },
                new Donor { Id = 3,  UserId = 4,  BloodGroup = "B+",  City = "Lahore",     LastDonationDate = new DateTime(2025,  1, 20), EligibilityStatus = "Eligible", ContactNumber = "0321-3456789", Age = 22, CreatedAt = new DateTime(2025, 2, 10) },
                new Donor { Id = 4,  UserId = 5,  BloodGroup = "AB+", City = "Islamabad",  LastDonationDate = new DateTime(2024,  9,  5), EligibilityStatus = "Eligible", ContactNumber = "0333-4567890", Age = 28, CreatedAt = new DateTime(2025, 2, 25) },
                new Donor { Id = 5,  UserId = 6,  BloodGroup = "O+",  City = "Lahore",     LastDonationDate = new DateTime(2024, 12, 10), EligibilityStatus = "Eligible", ContactNumber = "0345-5678901", Age = 35, CreatedAt = new DateTime(2025, 3,  5) },
                new Donor { Id = 6,  UserId = 7,  BloodGroup = "A-",  City = "Rawalpindi", LastDonationDate = new DateTime(2024,  7, 20), EligibilityStatus = "Eligible", ContactNumber = "0301-6789012", Age = 27, CreatedAt = new DateTime(2025, 3, 18) },
                new Donor { Id = 7,  UserId = 8,  BloodGroup = "O-",  City = "Lahore",     LastDonationDate = new DateTime(2024, 11,  1), EligibilityStatus = "Eligible", ContactNumber = "0312-7890123", Age = 32, CreatedAt = new DateTime(2025, 4,  1) },
                new Donor { Id = 8,  UserId = 9,  BloodGroup = "B-",  City = "Karachi",    LastDonationDate = new DateTime(2025,  2, 15), EligibilityStatus = "Eligible", ContactNumber = "0322-8901234", Age = 24, CreatedAt = new DateTime(2025, 4, 20) },
                new Donor { Id = 9,  UserId = 10, BloodGroup = "AB-", City = "Islamabad",  LastDonationDate = new DateTime(2024,  6, 10), EligibilityStatus = "Eligible", ContactNumber = "0334-9012345", Age = 40, CreatedAt = new DateTime(2025, 1,  5) },
                new Donor { Id = 10, UserId = 11, BloodGroup = "O+",  City = "Karachi",    LastDonationDate = new DateTime(2024,  5, 25), EligibilityStatus = "Eligible", ContactNumber = "0346-0123456", Age = 33, CreatedAt = new DateTime(2025, 1, 12) },
                new Donor { Id = 11, UserId = 12, BloodGroup = "A+",  City = "Rawalpindi", LastDonationDate = new DateTime(2024, 10, 30), EligibilityStatus = "Eligible", ContactNumber = "0302-1234568", Age = 29, CreatedAt = new DateTime(2025, 2,  3) },
                new Donor { Id = 12, UserId = 13, BloodGroup = "B+",  City = "Islamabad",  LastDonationDate = new DateTime(2024,  9, 14), EligibilityStatus = "Eligible", ContactNumber = "0313-2345679", Age = 26, CreatedAt = new DateTime(2025, 2, 18) },
                new Donor { Id = 13, UserId = 14, BloodGroup = "O+",  City = "Lahore",     LastDonationDate = new DateTime(2024, 12, 20), EligibilityStatus = "Eligible", ContactNumber = "0323-3456780", Age = 38, CreatedAt = new DateTime(2025, 3,  1) },
                new Donor { Id = 14, UserId = 15, BloodGroup = "AB+", City = "Karachi",    LastDonationDate = new DateTime(2024,  8,  8), EligibilityStatus = "Eligible", ContactNumber = "0335-4567891", Age = 31, CreatedAt = new DateTime(2025, 3, 22) },
                new Donor { Id = 15, UserId = 16, BloodGroup = "A-",  City = "Lahore",     LastDonationDate = new DateTime(2024, 11, 15), EligibilityStatus = "Eligible", ContactNumber = "0347-5678902", Age = 23, CreatedAt = new DateTime(2025, 4,  8) },
                new Donor { Id = 16, UserId = 17, BloodGroup = "B-",  City = "Rawalpindi", LastDonationDate = new DateTime(2024,  7,  5), EligibilityStatus = "Eligible", ContactNumber = "0303-6789013", Age = 36, CreatedAt = new DateTime(2025, 4, 15) },
                new Donor { Id = 17, UserId = 18, BloodGroup = "O-",  City = "Islamabad",  LastDonationDate = new DateTime(2025,  1,  3), EligibilityStatus = "Eligible", ContactNumber = "0314-7890124", Age = 42, CreatedAt = new DateTime(2025, 4, 25) },
                new Donor { Id = 18, UserId = 19, BloodGroup = "A+",  City = "Karachi",    LastDonationDate = new DateTime(2024, 10, 22), EligibilityStatus = "Eligible", ContactNumber = "0324-8901235", Age = 20, CreatedAt = new DateTime(2025, 5,  2) },
                new Donor { Id = 19, UserId = 20, BloodGroup = "B+",  City = "Lahore",     LastDonationDate = new DateTime(2024,  9, 29), EligibilityStatus = "Eligible", ContactNumber = "0336-9012346", Age = 45, CreatedAt = new DateTime(2025, 5,  9) },
                new Donor { Id = 20, UserId = 21, BloodGroup = "AB-", City = "Rawalpindi", LastDonationDate = new DateTime(2024,  8, 19), EligibilityStatus = "Eligible", ContactNumber = "0348-0123457", Age = 37, CreatedAt = new DateTime(2025, 5, 14) }
            );

            // ─── BLOOD REQUESTS ────────────────────────────────────
            modelBuilder.Entity<BloodRequest>().HasData(
                new BloodRequest { Id = 1,  PatientName = "Ahmad Pervaiz",  BloodGroup = "A+",  HospitalId = 1, Status = "Pending",   RequestDate = new DateTime(2025, 4,  1) },
                new BloodRequest { Id = 2,  PatientName = "Sobia Tahir",    BloodGroup = "O-",  HospitalId = 2, Status = "Fulfilled", RequestDate = new DateTime(2025, 3, 15) },
                new BloodRequest { Id = 3,  PatientName = "Dawood Sajid",   BloodGroup = "B+",  HospitalId = 3, Status = "Pending",   RequestDate = new DateTime(2025, 4, 10) },
                new BloodRequest { Id = 4,  PatientName = "Hira Baig",      BloodGroup = "AB-", HospitalId = 4, Status = "Pending",   RequestDate = new DateTime(2025, 4, 18) },
                new BloodRequest { Id = 5,  PatientName = "Faisal Riaz",    BloodGroup = "O+",  HospitalId = 5, Status = "Fulfilled", RequestDate = new DateTime(2025, 3, 28) },
                new BloodRequest { Id = 6,  PatientName = "Maryam Arshad",  BloodGroup = "A-",  HospitalId = 1, Status = "Pending",   RequestDate = new DateTime(2025, 5,  1) },
                new BloodRequest { Id = 7,  PatientName = "Naveed Alam",    BloodGroup = "B-",  HospitalId = 2, Status = "Pending",   RequestDate = new DateTime(2025, 5,  3) },
                new BloodRequest { Id = 8,  PatientName = "Rubina Ghafoor", BloodGroup = "O-",  HospitalId = 3, Status = "Fulfilled", RequestDate = new DateTime(2025, 4, 25) },
                new BloodRequest { Id = 9,  PatientName = "Saif Ullah",     BloodGroup = "AB+", HospitalId = 4, Status = "Pending",   RequestDate = new DateTime(2025, 5,  6) },
                new BloodRequest { Id = 10, PatientName = "Tahira Iqbal",   BloodGroup = "A+",  HospitalId = 5, Status = "Fulfilled", RequestDate = new DateTime(2025, 4, 30) }
            );

            // ─── 10 REVIEWS ────────────────────────────────────────
            modelBuilder.Entity<Review>().HasData(
                new Review { Id = 1,  UserId = 2,  Rating = 5, Comment = "Amazing platform! Found a donor in minutes. Truly life-saving.",           CreatedAt = new DateTime(2025, 3, 10) },
                new Review { Id = 2,  UserId = 3,  Rating = 5, Comment = "Very professional system. The smart matching feature is impressive!",       CreatedAt = new DateTime(2025, 2, 28) },
                new Review { Id = 3,  UserId = 5,  Rating = 4, Comment = "Great experience. Easy to register and find compatible donors.",            CreatedAt = new DateTime(2025, 4,  1) },
                new Review { Id = 4,  UserId = 7,  Rating = 5, Comment = "Life Link saved my sister's life. Cannot thank enough!",                   CreatedAt = new DateTime(2025, 3, 22) },
                new Review { Id = 5,  UserId = 9,  Rating = 4, Comment = "Smooth UI and quick results. Highly recommended.",                          CreatedAt = new DateTime(2025, 4,  5) },
                new Review { Id = 6,  UserId = 11, Rating = 3, Comment = "Good platform overall. Would love more filters in the search.",             CreatedAt = new DateTime(2025, 4, 12) },
                new Review { Id = 7,  UserId = 13, Rating = 5, Comment = "Blood request fulfilled within hours! Exceptional service.",                CreatedAt = new DateTime(2025, 4, 20) },
                new Review { Id = 8,  UserId = 15, Rating = 4, Comment = "The eligibility checker is a great feature. Very useful.",                  CreatedAt = new DateTime(2025, 4, 26) },
                new Review { Id = 9,  UserId = 17, Rating = 5, Comment = "Found 3 matching donors for my father's surgery. God bless this team!",    CreatedAt = new DateTime(2025, 5,  2) },
                new Review { Id = 10, UserId = 19, Rating = 4, Comment = "Reliable and fast. The hospital directory is also very helpful.",           CreatedAt = new DateTime(2025, 5,  7) }
            );
        }
    }
}
