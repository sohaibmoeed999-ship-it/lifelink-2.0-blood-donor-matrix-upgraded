# Object-Oriented Programming (OOP) in Life Link 2.0 (C#)

This report details how the four fundamental principles of Object-Oriented Programming (OOP)—**Encapsulation**, **Abstraction**, **Inheritance**, and **Polymorphism**—are effectively implemented within the C# backend (ASP.NET Core) of the Life Link 2.0 project.

---

## 1. Encapsulation
**Definition**: Bundling data (properties) and methods that operate on the data into a single unit (class), and restricting direct access to some of the object's components.

**Implementation in Life Link 2.0**:
In the models, encapsulation is heavily utilized to protect the integrity of the data and house business logic securely.

**Example: `Donor.cs`**
```csharp
public class Donor
{
    // Properties are encapsulated with getters and setters
    public int Id { get; set; }
    public string BloodGroup { get; set; } = string.Empty;
    public DateTime? LastDonationDate { get; set; }

    // Business logic for eligibility is encapsulated securely inside the class
    // This protects the calculation from being incorrectly altered elsewhere
    [NotMapped]
    public bool IsEligible =>
        LastDonationDate == null ||
        (DateTime.UtcNow - LastDonationDate.Value).TotalDays >= 90;
}
```

---

## 2. Abstraction
**Definition**: Hiding the complex implementation details and showing only the essential features of the object.

**Implementation in Life Link 2.0**:
Abstraction is achieved using **Interfaces**. The controllers do not need to know *how* the database operations are performed, only *what* operations are available.

**Example: `IDonorRepository.cs`**
```csharp
public interface IDonorRepository
{
    // Defines a clear contract without revealing the Entity Framework Core implementation details
    Task<IEnumerable<Donor>> GetAllAsync();
    Task<Donor?> GetByIdAsync(int id);
    Task<IEnumerable<Donor>> SearchAsync(string bloodGroup, string? city);
    Task AddAsync(Donor donor);
    Task UpdateAsync(Donor donor);
    Task DeleteAsync(int id);
}
```

---

## 3. Polymorphism
**Definition**: The ability of different objects to respond in their own way to the same method call. It allows classes to implement an interface or override base class methods differently.

**Implementation in Life Link 2.0**:
Polymorphism is primarily implemented via the Repository pattern, where concrete classes provide specific implementations of the interfaces.

**Example: `DonorRepository.cs`**
```csharp
// The Repository class acts as a polymorphic implementation of the IDonorRepository interface
public class DonorRepository : IDonorRepository
{
    private readonly AppDbContext _context;

    public DonorRepository(AppDbContext context)
    {
        _context = context;
    }

    // Concrete implementation of the abstracted method
    public async Task<IEnumerable<Donor>> GetAllAsync()
    {
        return await _context.Donors
            .Include(d => d.User)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }
    
    // Additional interface methods implemented here...
}
```
*Note: Because `DonorRepository` implements `IDonorRepository`, it can be substituted wherever the interface is expected (Dependency Injection).*

---

## 4. Inheritance
**Definition**: A mechanism where a new class derives properties and behaviors from an existing class, promoting code reusability.

**Implementation in Life Link 2.0**:
The ASP.NET Core framework relies heavily on inheritance, which is visibly utilized across all controller classes.

**Example: `DonorController.cs`**
```csharp
[ApiController]
[Route("api/[controller]")]
// DonorController inherits from ControllerBase, gaining access to built-in HTTP handling methods (Ok(), BadRequest(), etc.)
public class DonorController : ControllerBase
{
    private readonly DonorService _service;

    public DonorController(DonorService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var donors = await _service.GetAllDonorsAsync();
        
        // Ok() is inherited from ControllerBase
        return Ok(donors); 
    }
}
```

---

## Summary
The Life Link 2.0 project employs a professional, robust architecture. By strictly adhering to these four OOP principles, the codebase remains modular, maintainable, secure, and scalable.
