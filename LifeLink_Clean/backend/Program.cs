// ============================================================
// PROGRAM.CS — Application entry point
// Configures: DI container, JWT auth, CORS, EF Core (SQL Server), Swagger
// ============================================================
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using LifeLink.API.Data;
using LifeLink.API.Interfaces;
using LifeLink.API.Repositories;
using LifeLink.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── SERVICES ──────────────────────────────────────────────

// Add controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Use camelCase for JSON properties (React-friendly)
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
        // Ignore circular references to prevent object cycle exceptions (e.g. Hospital -> BloodRequests -> Hospital)
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Swagger for API testing
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ─── DATABASE: Entity Framework Core + SQL Server ──────────
// Reads the connection string from appsettings.json
// "Server=.;Database=LifeLinkDB;Trusted_Connection=True;TrustServerCertificate=True;"
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// ─── DEPENDENCY INJECTION — REPOSITORIES ───────────────────
// OOP: Polymorphism — each interface is resolved to its concrete class at runtime
builder.Services.AddScoped<IDonorRepository, DonorRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IHospitalRepository, HospitalRepository>();
builder.Services.AddScoped<IBloodRequestRepository, BloodRequestRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();

// ─── DEPENDENCY INJECTION — SERVICES ───────────────────────
builder.Services.AddScoped<DonorService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<HospitalService>();
builder.Services.AddScoped<BloodRequestService>();
builder.Services.AddScoped<ReviewService>();

// ─── JWT AUTHENTICATION ────────────────────────────────────
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

// ─── CORS — Allow React frontend (Vite dev server on port 5173) ────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ─── APP PIPELINE ──────────────────────────────────────────

var app = builder.Build();

// Development tools
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Middleware order matters!
app.UseCors("AllowReact");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Apply any pending EF Core migrations automatically on startup
// This keeps the DB schema in sync without manual steps every run
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // DB is already set up via LifeLinkDB_Setup.sql — EnsureCreated is safe here.
    // If the DB already exists with all tables, this is a no-op.
    context.Database.EnsureCreated();
}

app.Run();
