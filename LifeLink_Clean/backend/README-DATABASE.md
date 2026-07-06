# Life Link 2.0 - Database Integration Guide

This project has been successfully migrated from SQLite to **SQL Server**. 

## Setup Instructions

### Option 1: Using Entity Framework Core (Recommended)
This approach will automatically create the database and seed it with all mock data using EF Core Migrations.

1. Open your terminal in the `backend` folder.
2. Run the following commands to generate and apply the migrations:
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```
*(Note: Because we added `context.Database.Migrate()` in `Program.cs`, the database and all tables/seed data will also be created automatically the next time you run `dotnet run`!)*

### Option 2: Using the Raw SQL Script
If you prefer to create the database manually using SQL Server Management Studio (SSMS) or Azure Data Studio:

1. Open **SSMS** and connect to your local SQL Server instance.
2. Open the `LifeLinkDB_Setup.sql` file (located in the `backend` folder).
3. Execute (F5) the script.
4. It will create the `LifeLinkDB` database, all tables, relationships, and insert all the mock data (users, donors, hospitals, requests, and reviews).

## Configuration Check
The `appsettings.json` is configured to connect to your local SQL Server using Windows Authentication. 
```json
"DefaultConnection": "Server=.;Database=LifeLinkDB;Trusted_Connection=True;TrustServerCertificate=True;"
```
*If your SQL Server instance has a specific name (e.g., `SQLEXPRESS`), change `Server=.;` to `Server=.\\SQLEXPRESS;`*

## What was updated?
- **DbContext & Models:** Switched `AppDbContext` to SQL Server. Added `ContactNumber` and `Age` to `Donor`, and `BloodAvailability` to `Hospital`.
- **Seed Data:** Over 20 donors, 5 hospitals, 10 blood requests, and 10 reviews were added to the `AppDbContext` and the SQL script.
- **Repositories & Services:** Fully integrated Controller → Service → Repository layers for `Hospitals`, `BloodRequests`, and `Reviews`.
- **Smart Logic:** Donor eligibility is dynamically computed checking if the `LastDonationDate` is 90 days ago.
